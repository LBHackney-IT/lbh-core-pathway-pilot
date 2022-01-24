import { mockAnswerFilters } from "../../fixtures/answerFilter"
import data from "./answerFilters.json"

export interface AnswerFilter {
  id: string
  label: string
  formId?: string
  answers: {
    [key: string]: string[]
  }
}

/** if this is cypress, return a static mock form instead */
const answerFilters: AnswerFilter[] =
  process.env.NEXT_PUBLIC_ENV === "test" || process.env.NODE_ENV === "test"
    ? mockAnswerFilters
    : data

export default answerFilters
