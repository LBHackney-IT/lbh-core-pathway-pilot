import allElements from "./elements.json"
import { Step, FormElement } from "../../types"

export const baseAssessment = allElements.find(
  element => element.id === "Core assessment"
) as FormElement

export const assessmentElements = allElements.filter(
  element => !["Core assessment", "Support plan"].includes(element.name)
) as FormElement[]

export const wrapUp = allElements.find(
  element => element.id === "Support plan"
) as FormElement

const flattenSteps = element =>
  element.themes.reduce((acc, theme) => acc.concat(theme.steps), [])

export const allSteps: Step[] = allElements.reduce(
  (acc, element) => acc.concat(flattenSteps(element)),
  []
)
