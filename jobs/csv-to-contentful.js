const fetch = require("node-fetch")
const csv = require("csvtojson")
const contentful = require("contentful-management")
require("dotenv").config()

const run = async () => {
  try {
    const client = contentful.createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    })

    console.log("Fetching data...")
    const res = await fetch(process.env.DATA_SOURCE)
    const text = await res.text()
    const rows = await csv().fromString(text)

    // send to contentful somehow?
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID)
    const env = await space.getEnvironment("master")

    rows.forEach(async row => {
      const res = await env.createEntry("question", {
        fields: {
          // id: row["id"] || row["Question*"],
          question: { "en-US": row["Question*"] },
          type: { "en-US": row["Type*"] },
          hint: row["Hint"] ? { "en-US": row["Hint"] } : undefined,
          //   choices: row["Choices"] ? row["Choices"].split("\n") : undefined,
          //   conditions: row["Conditions"]
          //     ? row["Conditions"].split("\n").map(condition => ({
          //         id: condition.split("=")[0].trim(),
          //         value: condition.split("=")[1].trim(),
          //       }))
          //     : undefined,
          // subfields
          //   default: row["Default"] || undefined,
          //   placeholder: row["Placeholder"] || undefined,
          //   required: row["Required"] === "Yes",
          //   error: row["Custom error message"] || undefined,
          //   itemName: row["Item name"] || undefined,
          //   className: row["className"] || undefined,
        },
      })

      console.log(res)
    })

    // const entries = await env.getEntries()

    console.log("✅ Done")
  } catch (e) {
    console.error(e)
  }

  process.exit()
}

run()
