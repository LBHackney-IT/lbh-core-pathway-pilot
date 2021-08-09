const fetch = require("node-fetch")
const csv = require("csvtojson")
const fs = require("fs")
require("dotenv").config()

const run = async () => {
  try {
    console.log("Fetching data...")
    const res = await fetch(process.env.DATA_SOURCE)
    const text = await res.text()
    const rows = await csv().fromString(text)

    // remove header and subfield rows
    rows.shift()
    const filteredRows = rows.filter(
      row => row["Element*"] && row["Theme*"] && row["Step*"]
    )

    // 1. get every field
    console.log("Building fields...")
    const fields = filteredRows.map(f => ({
      element: f["Element*"], // remove this in later step
      theme: f["Theme*"], // remove this in later step
      step: f["Step*"], // remove this in later step
      id: f["Question*"],
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
            id: condition.split(" = ")[0].trim(),
            value: condition.split(" = ")[1].trim(),
          }))
        : undefined,
      // subfields
      default: f["Default"] || undefined,
      placeholder: f["Placeholder"] || undefined,
      required: f["Required"] === "Yes",
      error: f["Custom error message"] || undefined,
      itemName: f["Item name"] || undefined,
      className: f["className"],
    }))

    // 2. group fields by step

    console.log("Building steps...")
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
        })
      }
      return steps
    }, [])

    // 3. group steps by theme

    console.log("Building themes...")
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
        })
      }
      return themes
    }, [])

    // 4. group themes by form-element
    const elements = themes.reduce((elements, theme) => {
      const element = elements.find(
        elementToTest => elementToTest.name === theme.element
      )
      if (element) {
        element.themes.push(theme)
      } else {
        elements.push({
          id: theme.element,
          name: theme.element,
          themes: [theme],
        })
      }
      return elements
    }, [])

    // 5. clean up unneeded fields
    const cleanedElements = elements.map(element => ({
      ...element,
      themes: element.themes.map(theme => ({
        ...theme,
        element: undefined,
        steps: theme.steps.map(step => ({
          ...step,
          element: undefined,
          theme: undefined,
          fields: step.fields.map(field => ({
            ...field,
            element: undefined,
            theme: undefined,
            step: undefined,
          })),
        })),
      })),
    }))

    // 6. write to file
    fs.writeFileSync(
      "./config/forms/elements.json",
      JSON.stringify(cleanedElements, null, 2)
    )
    console.log("Done!")
  } catch (e) {
    console.error(e)
  }
}

run()
