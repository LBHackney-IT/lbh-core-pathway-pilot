import data from "./answerFilters.json"

export interface AnswerFilter {
  id: string
  label: string
  formId: string
  answers: {
    [key: string]: string[]
  }
}

const answerFilters: AnswerFilter[] = data

export default answerFilters
