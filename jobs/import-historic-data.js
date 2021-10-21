const fetch = require("node-fetch")
const csv = require("csvtojson")
const { PrismaClient } = require("@prisma/client")
const { google } = require("googleapis")
const token = require("../service-user-token.json")
require("dotenv").config()

const sheets = google.sheets("v4")

// account for different url styles
const getIdFromUrl = url => {
  const parts = url.split("/")
  if (parts[4] === "u") return parts[7]
  if (parts[4] === "d") return parts[5]
  return false
}

const run = async () => {
  try {
    // 0. set up a database connection and authenticate with google sheets api
    console.log("📡 1/5 Connecting to DB...")
    const db = new PrismaClient()

    console.log("🔐 2/5 Authenticating with Google...")
    const auth = new google.auth.JWT(
      token.client_email,
      null,
      token.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    )
    await auth.authorize()
    google.options({ auth })

    // 1. fetch mapping sheet
    console.log("🗺 3/5 Fetching mapping data...")
    const res = await fetch(process.env.HISTORIC_MAPPING_DATA_SOURCE)
    const text = await res.text()
    const allRows = await csv().fromString(text)
    const mappings = allRows.slice(1)

    // 2. get a list of all the unique response spreadsheets
    console.log("📑 4/5 Finding source form IDs...")
    const responseSheetIds = [
      ...new Set(
        mappings
          .map(row => ({
            url: row["Response spreadsheet URL"],
            id: getIdFromUrl(row["Response spreadsheet URL"]),
          }))
          .filter(id => id)
      ),
    ]

    // 3. for each response spreadsheet, pull it in as text, convert it to json and loop through the rows, adding a new workflow for each
    console.log("💾 5/5 Building and saving new workflows...")
    await responseSheetIds.forEach(async responseSheet => {
      const responses = await sheets.spreadsheets.values.get({
        spreadsheetId: responseSheet.id,
        range: "A1:Z10000",
      })

      responses.forEach(response => {
        const answers = {}

        mappings
          .filter(
            mapping => mapping["Response spreadsheet URL"] === responseSheet.url
          )
          .forEach(mapping => {
            answers[mapping["New step name"]][mapping["New field name"]] =
              response[mapping["Old column name"]]
          })

        await db.workflow.create({
          answers,
          // formId: ,
          // socialCareId: ,
          // createdAt: ,
          // createdBy:,
          // submittedAt: ,
          // submittedBy:,
          // managerApprovedBy: ,
          // reviewBefore: ,
        })
      })
    })

    console.log(`\n ✅ Done`)
  } catch (e) {
    console.error(e)
  }
}

run()
