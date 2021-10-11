const fetch = require("node-fetch")
const csv = require("csvtojson")
const { PrismaClient } = require("@prisma/client")
require("dotenv").config()

const run = async () => {
  // 0. set up a database connection
  const db = new PrismaClient()

  // 1. fetch mapping sheet
  console.log("Fetching mapping data...")
  const res = await fetch(process.env.HISTORIC_MAPPING_DATA_SOURCE)
  const text = await res.text()
  const allRows = await csv().fromString(text)
  const rows = allRows.slice(1)

  // 2. get a list of all the unique response spreadsheets
  console.log("Finding source forms...")
  const responseSheetUrls = [
    ...new Set(rows.map(row => row["Response spreadsheet URL"])),
  ]

  // 3. for each response spreadsheet, pull it in as text, convert it to json and loop through the rows, adding a new workflow for each
  responseSheetUrls.forEach(sheetUrl => {
    // TODO: fetch sheet here somehow
    let responses = sheetUrl
    responses.forEach(response => {
      console.log(response)
      db.workflow.create({})
    })
  })

  console.log(`✅ Done`)
}

run()
