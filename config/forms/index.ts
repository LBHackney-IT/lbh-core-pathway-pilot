import forms from "./forms.json"
import { Form, Step } from "../../types"
import { mockForm } from "../../fixtures/form"

const flattenSteps = element =>
  element.themes.reduce((acc, theme) => acc.concat(theme.steps), [])

/** if this is cypress, return a static mock form instead */
export const formsForThisEnv = (): Form[] =>
  process.env.NEXT_PUBLIC_ENV === "test" || process.env.NODE_ENV === "test"
    ? [mockForm]
    : forms

/** flat array of all the steps, across all elements and themes  */
export const allSteps: Step[] = formsForThisEnv().reduce(
  (acc, element) => acc.concat(flattenSteps(element)),
  []
)

export default formsForThisEnv()
