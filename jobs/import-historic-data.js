const fetch = require("node-fetch")
const csv = require("csvtojson")
const { PrismaClient, WorkflowType } = require("@prisma/client")
const { google } = require("googleapis")
const _ = require("lodash")
const forms = require("../config/forms/forms.json")
const hash = require("object-hash")
const { DateTime } = require("luxon")
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

// convert a google sheet date or datetime string to a js date object
const normaliseDate = string =>
  DateTime.fromFormat(string, "DD/MM/yyyy HH:mm:ss")

const run = async () => {
  try {
    // 0. set up a database connection and authenticate with google sheets api
    console.log("📡 1/5 Connecting to DB...")
    const db = new PrismaClient()

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
    let failCount = 0

    await Promise.all(
      responseSheetIds.map(async responseSheetId => {
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

        await Promise.all(
          responses.map(async response => {
            const answers = {}

            relevantMappings.forEach(mapping => {
              // only add truthy values to the answers block
              if (
                mapping["New step name"] &&
                mapping["New field ID"] &&
                response[mapping["Question"]]
              )
                _.set(
                  answers,
                  `${mapping["New step name"]}.${mapping["New field ID"]}`,
                  response[mapping["Question"]]
                )
            })

            const newData = {
              answers,
              type: WorkflowType.Historic,
              formId: forms.find(
                form => form.name === mappings[0]["New form name"]
              ).id,
              socialCareId: getSpecialField(
                mappings,
                response,
                "Is social care ID?"
              ),
              // TODO: everything below here is broken rn
              createdAt: normaliseDate(
                getSpecialField(
                  relevantMappings,
                  response,
                  "Is timestamp start?"
                )
              ),
              createdBy: getSpecialField(mappings, "Is creator email address?"),
              submittedAt: normaliseDate(
                getSpecialField(
                  relevantMappings,
                  response,
                  "Is timestamp submit?"
                )
              ),
              // submittedBy:,
              // managerApprovedBy: ,
              reviewBefore: normaliseDate(
                getSpecialField(relevantMappings, response, "Is review date?")
              ),
            }

            const id = deterministicId(newData)
            newData.id = id

            if (newData.socialCareId && newData.formId) {
              console.log(`Adding ${id}...`)
              await db.workflow.upsert({
                where: {
                  id,
                },
                update: newData,
                create: newData,
              })

              // await db.workflow.create({
              //   data: newData,
              // })

              count++
            } else {
              failCount++
            }
          })
        )
      })
    )

    console.log(
      `\n✅ Done: ${count} sheet responses were turned into workflows`
    )
    if (failCount) console.log(`❗️ ${failCount} sheet responses failed`)
    process.exit()
  } catch (e) {
    console.error(e)
    process.exit()
  }
}

run()
