const fetch = require("node-fetch")
const csv = require("csvtojson")
require("dotenv").config()

const run = async () => {
  // 1. fetch mapping sheet
  const res = await fetch(process.env.HISTORIC_MAPPING_DATA_SOURCE)
  const text = await res.text()
  const rows = await csv().fromString(text)

  //   2. find the source forms
}

run()
