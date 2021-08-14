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
    let rows = await csv().fromString(text)

    // remove header and subfield rows
    rows.shift()
    rows = rows.filter(row => row["Theme*"] && row["Step*"])

    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID)
    const env = await space.getEnvironment("master")

    console.log("Deleting old content...")
    const entries = await env.getEntries({
      limit: 1000,
    })
    await Promise.all(
      entries.items.map(async entry => await env.deleteEntry(entry.sys.id))
    )

    console.log("Adding fields...")
    const fields = await Promise.all(
      rows.map(async row => {
        const entry = await env.createEntry("question", {
          fields: {
            // TODO: ids
            // id: {
            //   "en-US": row["id"] || row["Question*"].substring(0, 254),
            // },
            question: { "en-US": row["Question*"].substring(0, 254) },
            type: { "en-US": row["Type*"] },
            hint: row["Hint"]
              ? { "en-US": row["Hint"].substring(0, 254) }
              : undefined,
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
            // TODO: subfields
            default: { "en-US": row["Default"] },
            placeholder: { "en-US": row["Placeholder"] },
            required: { "en-US": row["Required"] === "Yes" },
            error: { "en-US": row["Custom error message"] },
            itemName: { "en-US": row["Item name"] },
            className: { "en-US": row["className"] },
          },
        })
        return {
          ...entry,
          step: row["Step*"],
          theme: row["Theme*"],
        }
      })
    )

    console.log("Building steps...")
    const stepNames = rows.map(row => row["Step*"])
    const steps = await Promise.all(
      [...new Set(stepNames)].map(async stepName => {
        const fieldLinks = fields
          .filter(field => field.step === stepName)
          .map(field => ({
            sys: {
              linkType: "Entry",
              id: field.sys.id,
            },
          }))
        const step = await env.createEntry("step", {
          fields: {
            name: { "en-US": stepName },
            fields: fieldLinks
              ? {
                  "en-US": fieldLinks,
                }
              : undefined,
          },
        })

        return {
          ...step,
          theme: fields
            .filter(field => field.step === stepName)
            .find(field => field?.theme)?.theme,
        }
      })
    )

    console.log("Building themes...")
    const themeNames = rows.map(row => row["Theme*"])
    const themes = await Promise.all(
      [...new Set(themeNames)].map(async themeName => {
        const stepLinks = steps
          .filter(step => step.theme === themeName)
          .map(step => ({
            sys: {
              linkType: "Entry",
              id: step.sys.id,
            },
          }))

        console.log(stepLinks)

        return await env.createEntry("theme", {
          fields: {
            name: { "en-US": themeName },
            steps: stepLinks
              ? {
                  "en-US": stepLinks,
                }
              : undefined,
          },
        })
      })
    )

    console.log("Building forms...")
    const formNames = [
      "Screening",
      "Care act assessment",
      "Occupational therapy assessment",
      "Carer's assessment",
      "Sensory assessment",
      "Rapid assessment (formerly IIT / 2DA)",
    ]
    const forms = await Promise.all(
      formNames.map(
        async formName =>
          await env.createEntry("form", {
            fields: {
              name: { "en-US": formName },
            },
          })
      )
    )

    console.log(
      `✅ Done!\n\n🔵 ${fields.length} fields created\n🔵 ${steps.length} steps created\n🔵 ${themes.length} themes created\n⚪️ ${forms.length} forms created`
    )
  } catch (e) {
    console.error(e)
  }
}

run()
