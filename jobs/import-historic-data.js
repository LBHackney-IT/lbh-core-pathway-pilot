const fetch = require("node-fetch")
const csv = require("csvtojson")
require("dotenv").config()

const run = async () => {
  // 1. fetch mapping sheet
  console.log("Fetching mapping data...")
  const res = await fetch(process.env.HISTORIC_MAPPING_DATA_SOURCE)
  const text = await res.text()
  const allRows = await csv().fromString(text)
  const rows = allRows.slice(1)

  //   2. find the source forms
  console.log("Finding source forms...")
  console.log(rows[0])
}

run()
