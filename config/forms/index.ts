import occupationalTherapy from "./_occupationalTherapy"
import base from "./_base"
import wrap from "./_wrapUp"
import { Step } from "../../types"

export const baseAssessment = base
export const assessmentElements = [occupationalTherapy]
export const wrapUp = wrap

const flattenSteps = form =>
  form.themes.reduce(
    (acc, theme) => acc.concat(theme.steps),

    []
  )

export const allSteps: Step[] = [
  ...flattenSteps(base),
  assessmentElements.map(element => flattenSteps(element)),
  ...flattenSteps(wrap),
]
