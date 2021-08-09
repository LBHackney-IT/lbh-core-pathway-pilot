import allElements from "./elements.json"
import { Step, FormElement } from "../../types"

/** the required chunk of questions that must begin every assessment */
export const baseAssessment = allElements.find(
  element => element.id === "Core assessment"
) as FormElement

/** an array of the optional "branches" that can be added onto the middle of an assessment */
export const assessmentElements = allElements.filter(
  element => !element.requiredElement
) as FormElement[]

/** the required chunk of questions that must end every assessment */
export const wrapUp = allElements.find(
  element => element.id === "Support plan"
) as FormElement

const flattenSteps = element =>
  element.themes.reduce((acc, theme) => acc.concat(theme.steps), [])

/** flat array of all the steps, across all elements and themes  */
export const allSteps: Step[] = allElements.reduce(
  (acc, element) => acc.concat(flattenSteps(element)),
  []
)
