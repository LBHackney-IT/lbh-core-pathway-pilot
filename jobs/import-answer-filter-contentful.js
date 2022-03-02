require("dotenv").config()
const fs = require("fs")
const fetch = require("node-fetch")

const generateTeams = (data) =>
  data.includes.Entry.map(i => i.fields?.interestedTeams)
    .filter(t => !!t)
    .flat()
    .filter((t, i, a) => a.indexOf(t) === i)
    .map(label => ({
      id: label.toLowerCase().split(' ').join('-'),
      label,
    }));


const generateAnswers = (steps, linkedEntries, team) =>
  steps.reduce((acc, step) => {
    const fieldsInThisStep = step.fields.fields.map(field => {
      const contentfulId = field.sys.id
      return linkedEntries.find(entry => entry.sys.id === contentfulId)
    })

    const fieldsToInclude = fieldsInThisStep
      .filter(linkedEntry =>
        linkedEntry?.fields?.interestedTeams?.includes(team)
      ).map(
        linkedEntry => linkedEntry?.fields.id || linkedEntry?.fields.question
      ).map(entry =>
        entry.trim()
      );

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

    const teams = generateTeams(data);
    const steps = data.items
    const linkedEntries = data?.includes?.Entry

    const output = teams.map(t => ({
      ...t,
      answers: generateAnswers(steps, linkedEntries, t.label),
    }))

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

module.exports = run
