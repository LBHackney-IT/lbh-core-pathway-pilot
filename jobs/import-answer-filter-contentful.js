require("dotenv").config()
const csv = require("csvtojson")
const fs = require("fs")
const fetch = require("node-fetch")


const generateAnswers = (steps, linkedEntries, team) => 
  steps.reduce((acc, step) => {
    const fieldsInThisStep = step.fields.fields.map(field => {
      const contentfulId = field.sys.id
      return linkedEntries.find(entry => entry.sys.id === contentfulId)
    })

    const fieldsToInclude = fieldsInThisStep.filter(linkedEntry => linkedEntry?.fields?.interestedTeams?.includes(team))
      .map(linkedEntry => linkedEntry?.fields.id  || linkedEntry?.fields.question)

    acc[step.fields.name] = fieldsToInclude || []
    return acc
  }, {})

const run = async () => {
  try {
    console.log("📡 Running job...")

    const res = await fetch(
      `https://cdn.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master/entries?content_type=step&include=10`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
        },
      }
    )
    const data = await res.json()

    const steps = data.items
    const linkedEntries = data?.includes?.Entry

    const output = [
      {
        id: "direct-payments",
        label: "Direct payments",
        answers: generateAnswers(steps, linkedEntries, "Direct payments")
      },
      {
        id: "brokerage",
        label: "Brokerage",
        answers: generateAnswers(steps, linkedEntries, "Brokerage")
      },
    ]

    fs.writeFileSync(
      "./config/answerFilters/answerFilters.json",
      JSON.stringify(output, null, 2)
    )

    console.log(`✅ Done`)
  } catch (e) {
    console.log(e)
  }
  process.exit()
}

run()
