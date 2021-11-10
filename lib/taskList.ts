import { FlexibleAnswers, Form, Step, StepAnswers, Theme } from "../types"
import forms from "../config/forms"
import { Prisma, Revision } from ".prisma/client"
// import Prisma, { Revision } from "@prisma/client"

export const allThemes = async (): Promise<Theme[]> =>
  (await forms()).map(element => element.themes).flat()

/** construct the right task list based on what assessment elements are included */
export const groupAnswersByTheme = async (
  answers: FlexibleAnswers
): Promise<{
  [key: string]: StepAnswers[]
}> => {
  const themedAnswers = {}
  const allThemesResolved = await allThemes()
  Object.entries(answers).forEach(([stepId, stepAnswers]) => {
    const themeForThisStep = allThemesResolved.find(themeToTest =>
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

const workflowForCompleteness = Prisma.validator<Prisma.WorkflowArgs>()({
  select: {
    answers: true,
  },
})
export type WorkflowForCompleteness = Prisma.WorkflowGetPayload<
  typeof workflowForCompleteness
>

/** decimal value for the completeness */
export const completeness = (
  workflow: WorkflowForCompleteness & { form?: Form },
  revision?: Revision
): number => {
  const completedSteps = Object.keys(
    revision?.answers || workflow.answers
  ).length
  const totalSteps = totalStepsFromThemes(workflow?.form?.themes || [])
  return Math.min(completedSteps / totalSteps, 1)
}

/** get all the steps in an element */
export const allStepsInForm = (form: Form): Step[] =>
  form?.themes.reduce((acc, theme) => acc.concat(theme.steps), [])
