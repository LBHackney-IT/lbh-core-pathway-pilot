const fetch = require("node-fetch")
const csv = require("csvtojson")
const contentful = require("contentful-management")
require("dotenv").config()

const run = async () => {
  try {
    const client = await contentful.createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
    })

    console.log("Fetching data...")
    const res = await fetch(process.env.DATA_SOURCE)
    const text = await res.text()
    const rows = await csv().fromString(text)

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID)
    const env = await space.getEnvironment("master")

    await rows.slice(0, 5).map(
      async row =>
        await env.createEntry("question", {
          fields: {
            id: { "en-US": row["id"] || row["Question*"] },
            question: { "en-US": row["Question*"] },
            type: { "en-US": row["Type*"] },
            hint: row["Hint"] ? { "en-US": row["Hint"] } : undefined,
            choices: row["Choices"]
              ? { "en-US": row["Choices"].split("\n") }
              : undefined,
            conditions: {
              "en-US": row["Conditions"]
                ? row["Conditions"].split("\n").map(condition => ({
                    id: condition.split("=")[0].trim(),
                    value: condition.split("=")[1].trim(),
                  }))
                : undefined,
            },
            // subfields
            default: { "en-US": row["Default"] },
            placeholder: { "en-US": row["Placeholder"] },
            required: { "en-US": row["Required"] === "Yes" },
            error: { "en-US": row["Custom error message"] },
            itemName: { "en-US": row["Item name"] },
            className: { "en-US": row["className"] },
          },
        })
    )

    console.log(`✅ Done`)
  } catch (e) {
    console.error(e)
  }

  //   process.exit()
}

run()
