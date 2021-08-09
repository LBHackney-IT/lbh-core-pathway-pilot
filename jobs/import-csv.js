const fetch = require("node-fetch")
const csv = require("csvtojson")
require("dotenv").config()

const run = async () => {
  try {
    const res = await fetch(process.env.DATA_SOURCE)
    const text = await res.text()
    const rows = await csv().fromString(text)

    // remove header row
    rows.shift()

    // 1. get every field
    const fields = rows.map(f => ({
      element: f["Element*"], // remove this in later step
      theme: f["Theme*"], // remove this in later step
      step: f["Step*"], // remove this in later step
      id: f["Question*"],
      question: f["Question*"],
      type: f["Type*"],
      hint: f["Hint"] || false,
      choices: f["Choices"].split(",").map(choice => ({
        label: choice,
        value: choice,
      })),
      // subfields
      default: f["Default"] || false,
      placeholder: f["Placeholder"] || false,
      required: f["Required"] === "Yes",
      error: f["Custom error message"] || false,
      itemName: f["Item name"] || false,
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
          theme: field.theme, // remove this in later step
          element: field.element, // remove this in later step
          fields: [field],
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
        })
      }
      return themes
    }, [])

    // 4. group themes by form-element
    const elements = steps.reduce((elements, theme) => {
      const element = themes.find(elToTest => elToTest.name === theme.element)

      // TODO make this work
      // elements[theme.element] = {
      //   ...elements[theme.element],
      //   theme
      // }

      return elements
    }, {})

    console.log(elements)
  } catch (e) {
    console.error(e)
  }
}

run()
