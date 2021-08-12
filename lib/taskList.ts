import {
  FlexibleAnswers,
  Form,
  Step,
  StepAnswers,
  Theme,
  WorkflowWithForm,
} from "../types"
import forms from "../config/forms"
import { Revision, Workflow } from "@prisma/client"

export const allThemes = (): Theme[] => {
  const allThemes = []
  forms.map(element => element.themes.map(theme => allThemes.push(theme)))
  return allThemes
}

/** construct the right task list based on what assessment elements are included */
export const groupAnswersByTheme = (
  answers: FlexibleAnswers
): {
  [key: string]: StepAnswers[]
} => {
  const themedAnswers = {}
  Object.entries(answers).forEach(([stepId, stepAnswers]) => {
    const themeForThisStep = allThemes().find(themeToTest =>
      themeToTest.steps.find(stepToTest => stepToTest.id === stepId)
    )
    if (themeForThisStep) {
      themedAnswers[themeForThisStep.id] = {
        ...themedAnswers[themeForThisStep.id],
        [stepId]: stepAnswers,
      }
    }
  })
  return themedAnswers
}

/** from the set of themes, calculate the total steps */
export const totalStepsFromThemes = (themes: Theme[]): number =>
  themes.reduce((acc, theme) => acc + theme.steps.length, 0)

/** decimal value for the completeness */
export const completeness = (
  workflow: WorkflowWithForm,
  revision?: Revision
): number => {
  const completedSteps = Object.keys(
    revision?.answers || workflow.answers
  ).length
  const totalSteps = totalStepsFromThemes(workflow.form.themes || [])
  return Math.min(completedSteps / totalSteps, 1)
}

/** get all the steps in an element */
export const allStepsInForm = (form: Form): Step[] =>
  form.themes.reduce((acc, theme) => acc.concat(theme.steps), [])
