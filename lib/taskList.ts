import { Theme } from "../types"
import { baseAssessment, assessmentElements, wrapUp } from "../config/forms"
import { Revision, Workflow } from "@prisma/client"

/** construct the right task list based on what assessment elements are included */
export const buildThemes = (workflow: Workflow): Theme[] => {
  let themes = [].concat(baseAssessment.themes)
  assessmentElements.map(element => {
    if (workflow.assessmentElements.includes(element.id))
      themes = themes.concat(element.themes)
  })
  themes = themes.concat(wrapUp.themes)
  return themes
}

/** from the set of themes, calculate the total steps */
export const totalStepsFromThemes = (themes: Theme[]): number =>
  themes.reduce((acc, theme) => acc + theme.steps.length, 0)

/** decimal value for the completeness */
export const completeness = (
  workflow: Workflow,
  revision?: Revision
): number => {
  const themes = buildThemes(workflow)
  const completedSteps = Object.keys(
    revision?.answers || workflow.answers
  ).length
  const totalSteps = totalStepsFromThemes(themes)
  return completedSteps / totalSteps
}
