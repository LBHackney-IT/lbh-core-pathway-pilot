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
    console.log("Connecting to DB...")
    const db = new PrismaClient()

    console.log("Authenticating with Google...")
    const auth = new google.auth.JWT(
      token.client_email,
      null,
      token.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    )
    await auth.authorize()
    google.options({ auth })

    // 1. fetch mapping sheet
    console.log("Fetching mapping data...")
    const res = await fetch(process.env.HISTORIC_MAPPING_DATA_SOURCE)
    const text = await res.text()
    const allRows = await csv().fromString(text)
    const rows = allRows.slice(1)

    // 2. get a list of all the unique response spreadsheets
    console.log("Finding source forms...")
    const responseSheetIds = [
      ...new Set(
        rows
          .map(row => getIdFromUrl(row["Response spreadsheet URL"]))
          .filter(id => id)
      ),
    ]

    // 3. for each response spreadsheet, pull it in as text, convert it to json and loop through the rows, adding a new workflow for each
    await responseSheetIds.forEach(async spreadsheetId => {
      const responses = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "Sheet1!A1:Z1000",
      })
      responses.forEach(response => {
        console.log(response)
        // TODO: apply mapping logic to the new workflow here
        db.workflow.create({})
      })
    })

    console.log(`✅ Done`)
  } catch (e) {
    console.error(e)
  }
}

run()
