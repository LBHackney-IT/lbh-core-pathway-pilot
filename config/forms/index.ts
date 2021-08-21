import forms from "./forms.json"
import { Form, Step } from "../../types"
import { mockForm } from "../../fixtures/form"

const flattenSteps = element =>
  element.themes.reduce((acc, theme) => acc.concat(theme.steps), [])

/** flat array of all the steps, across all elements and themes  */
export const allSteps: Step[] = forms.reduce(
  (acc, element) => acc.concat(flattenSteps(element)),
  []
)

/** if this is cypress, return a static mock form instead */
const formsForThisEnv =
  process.env.NODE_ENV === "test" ? [mockForm] : (forms as Form[])

export default formsForThisEnv
