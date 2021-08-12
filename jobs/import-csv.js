const fetch = require("node-fetch")
const csv = require("csvtojson")
const fs = require("fs")
require("dotenv").config()

const assessments = {
  "Care act assessment": "Assessment*",
  Screening: "field2",
  "Occupational therapy": "field3",
  "Carer's assessment": "field4",
  "Sensory assessment": "field5",
}

const slugify = string =>
  string
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s/g, "-")

const convertRowsToThemes = rows => {
  // remove header and subfield rows
  rows.shift()
  const filteredRows = rows.filter(row => row["Theme*"] && row["Step*"])

  // 1. get every field
  const fields = filteredRows.map(f => ({
    element: f["Element*"], // remove this in later step
    requiredElement: f["Element is required?"] === "Yes",
    theme: f["Theme*"], // remove this in later step
    step: f["Step*"], // remove this in later step
    id: f["id"] || f["Question*"],
    question: f["Question*"],
    type: f["Type*"],
    hint: f["Hint"] || undefined,
    choices: f["Choices"]
      ? f["Choices"].split("\n").map(choice => ({
          label: choice,
          value: choice,
        }))
      : undefined,
    conditions: f["Conditions"]
      ? f["Conditions"].split("\n").map(condition => ({
          id: condition.split("=")[0].trim(),
          value: condition.split("=")[1].trim(),
        }))
      : undefined,
    // subfields
    default: f["Default"] || undefined,
    placeholder: f["Placeholder"] || undefined,
    required: f["Required"] === "Yes",
    error: f["Custom error message"] || undefined,
    itemName: f["Item name"] || undefined,
    className: f["className"] || undefined,
  }))

  // 2. group fields by step
  const steps = fields.reduce((steps, field) => {
    const step = steps.find(stepToTest => stepToTest.name === field.step)
    if (step) {
      step.fields.push(field)
    } else {
      steps.push({
        id: field.step,
        name: field.step,
        fields: [field],
        theme: field.theme, // remove this in later step
        element: field.element, // remove this in later step
        requiredElement: field.requiredElement, // remove this in later step
      })
    }
    return steps
  }, [])

  // 3. group steps by theme
  const themes = steps.reduce((themes, step) => {
    const theme = themes.find(themeToTest => themeToTest.name === step.theme)
    if (theme) {
      theme.steps.push(step)
    } else {
      themes.push({
        id: step.theme,
        name: step.theme,
        steps: [step],
        element: step.element, // remove this in later step
        requiredElement: step.requiredElement, // remove this in later step
      })
    }
    return themes
  }, [])

  // 5. clean up unneeded keys
  return themes.map(theme => ({
    ...theme,
    element: undefined,
    requiredElement: undefined,
    steps: theme.steps.map(step => ({
      ...step,
      element: undefined,
      theme: undefined,
      requiredElement: undefined,
      fields: step.fields.map(field => ({
        ...field,
        element: undefined,
        theme: undefined,
        step: undefined,
        requiredElement: undefined,
      })),
    })),
  }))
}

const run = async () => {
  try {
    console.log("Fetching data...")
    const res = await fetch(process.env.DATA_SOURCE)
    const text = await res.text()
    const rows = await csv().fromString(text)

    const forms = Object.keys(assessments).map(assessmentName => {
      console.log(`Converting ${assessmentName}...`)
      return {
        id: slugify(assessmentName),
        name: assessmentName,
        themes: convertRowsToThemes(
          rows.filter(row => row[assessments[assessmentName]] === "Yes")
        ),
      }
    })

    fs.writeFileSync(
      "./config/forms/forms.json",
      JSON.stringify(forms, null, 2)
    )
    console.log(`✅ ${forms.length} forms done!`)
  } catch (e) {
    console.error(e)
  }

  process.exit()
}

run()
