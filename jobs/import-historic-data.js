const fetch = require("node-fetch")
const csv = require("csvtojson")
const { PrismaClient, WorkflowType } = require("@prisma/client")
const { google } = require("googleapis")
const _ = require("lodash")
const forms = require("../config/forms/forms.json")
const hash = require("object-hash")
const { DateTime } = require("luxon")
const fs = require("fs")
require("dotenv").config()

const sheets = google.sheets("v4")

// account for different url styles
const getIdFromUrl = url => {
  const parts = url.split("/")
  if (parts[4] === "u") return parts[7]
  if (parts[4] === "d") return parts[5]
  return false
}

// generate a predictable id from response data
const deterministicId = answers =>
  hash(answers, {
    algorithm: "md5",
  })

// grab a specific piece of metadata
const getSpecialField = (mappings, response, field) =>
  mappings
    .filter(mapping => mapping[field] === "TRUE")
    .map(mapping => response[mapping["Question"]])
    .find(val => val)
    ?.toLowerCase()
    ?.trim()

// convert a google sheet date or datetime string to a js date object
const normaliseDate = string => {
  if (!string) return undefined
  const testable = DateTime.fromFormat(string, "dd/MM/yyyy HH:mm:ss")
  if (testable.isValid) {
    return testable.toISO()
  } else {
    const testable2 = DateTime.fromFormat(string, "dd/MM/yyyy")
    if (testable2.isValid) {
      return testable2.toISO()
    } else {
      return undefined
    }
  }
}

const run = async () => {
  try {
    // 0. set up a database connection and authenticate with google sheets api
    console.log("📡 1/5 Connecting to DB...")
    const db = new PrismaClient()

    db.$use(async (params, next) => {
      const before = Date.now()
      const result = await next(params)
      const after = Date.now()
      console.log(
        `Query ${params.model}.${params.action} took ${after - before}ms`
      )
      return result
    })

    console.log("🔐 2/5 Authenticating with Google...")
    const auth = new google.auth.JWT(
      process.env.SERVICE_USER_EMAIL,
      null,
      process.env.SERVICE_USER_PRIVATE_KEY,
      ["https://www.googleapis.com/auth/spreadsheets"]
    )
    await auth.authorize()
    google.options({ auth })

    // 1. fetch mapping sheet
    console.log("🗺  3/5 Fetching mapping data...")
    const res = await fetch(process.env.HISTORIC_MAPPING_DATA_SOURCE)
    const text = await res.text()
    const allRows = await csv().fromString(text)
    const mappings = allRows.slice(1)

    // 2. get a list of all the unique response spreadsheets
    console.log("📑 4/5 Finding source form IDs...")
    const responseSheetIds = [
      ...new Set(
        mappings
          .map(row => getIdFromUrl(row["Response spreadsheet URL"]))
          .filter(id => id)
      ),
    ]

    // 3. for each response spreadsheet, pull it in as text, convert it to json and loop through the rows, adding a new workflow for each
    console.log("💾 5/5 Building and saving new workflows...")

    let count = 0
    const fails = []

    for (let index = 0; index < responseSheetIds.length; index++) {
      const responseSheetId = responseSheetIds[index]

      const {
        data: { values },
      } = await sheets.spreadsheets.values.get({
        spreadsheetId: responseSheetId,
        range: "A1:ZZ10000",
      })

      // convert multidimensional array into object
      const responses = values
        .map(row => {
          const response = {}
          row.forEach((cell, i) => (response[values[0][i]] = cell))
          return response
        })
        // remove headers
        .slice(1)

      // get mappings for this response sheet only
      const relevantMappings = mappings.filter(mapping =>
        mapping["Response spreadsheet URL"].includes(responseSheetId)
      )

      // for (let index = 0; index < responses.length; index++) {
      for (let index = 0; index < 5; index++) {
        const response = responses[index]

        const answers = {}

        relevantMappings.forEach(mapping => {
          // only add truthy values to the answers block
          if (
            mapping["New step name"] &&
            mapping["New field ID"] &&
            response[mapping["Question"]]
          ) {
            let existingAnswer = _.get(
              answers,
              `${mapping["New step name"]}.${mapping["New field ID"]}`
            )
            _.set(
              answers,
              `${mapping["New step name"]}.${mapping["New field ID"]}`,
              // concatenate answers with a common id rather than overwriting
              existingAnswer
                ? (existingAnswer += response[mapping["Question"]])
                : response[mapping["Question"]]
            )
          }
        })

        const creatorEmail = getSpecialField(
          mappings,
          response,
          "Is creator email address?"
        )
        const approverEmail = getSpecialField(
          mappings,
          response,
          "Is manager/approver email address?"
        )

        const newData = {
          answers,
          type: WorkflowType.Historic,
          formId: forms.find(form => form.name === mappings[0]["New form name"])
            .id,
          socialCareId: getSpecialField(
            mappings,
            response,
            "Is social care ID?"
          ),
          createdAt: normaliseDate(
            getSpecialField(relevantMappings, response, "Is timestamp start?")
          ),
          creator: {
            connectOrCreate: {
              create: { email: creatorEmail },
              where: { email: creatorEmail },
            },
          },
          submitter: {
            connectOrCreate: {
              create: { email: creatorEmail },
              where: { email: creatorEmail },
            },
          },
          managerApprover: {
            connectOrCreate: {
              create: { email: approverEmail },
              where: { email: approverEmail },
            },
          },
          submittedAt: normaliseDate(
            getSpecialField(relevantMappings, response, "Is timestamp submit?")
          ),
          managerApprovedAt: normaliseDate(
            getSpecialField(relevantMappings, response, "Is timestamp submit?")
          ),
          reviewBefore: normaliseDate(
            getSpecialField(relevantMappings, response, "Is review date?")
          ),
        }

        const id = deterministicId(newData)

        if (newData.socialCareId && newData.formId) {
          console.log(`Adding ${id}...`)

          await db.workflow.upsert({
            where: {
              id,
            },
            update: newData,
            create: {
              id,
              ...newData,
            },
          })

          count++
        } else {
          fails.push(response)
        }
      }
    }

    console.log(
      `\n✅ Done: ${count} sheet responses were turned into workflows`
    )
    if (fails.length > 0) {
      console.log(
        `❗️ ${fails.length} sheet responses failed due to missing social care or form ID. Find them in fails.json`
      )
      fs.writeFileSync("fails.json", JSON.stringify(fails, null, 2))
    }

    process.exit()
  } catch (e) {
    console.error(e)
    process.exit()
  }
}

run()

module.exports.handler = async () => await run()
