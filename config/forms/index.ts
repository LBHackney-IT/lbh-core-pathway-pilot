import allElements from "./forms.json"
import { Form, Step } from "../../types"

const flattenSteps = element =>
  element.themes.reduce((acc, theme) => acc.concat(theme.steps), [])

/** flat array of all the steps, across all elements and themes  */
export const allSteps: Step[] = allElements.reduce(
  (acc, element) => acc.concat(flattenSteps(element)),
  []
)

export default allElements as Form[]
