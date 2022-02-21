import useSWR, { SWRResponse } from "swr"
import { AnswerFilter } from "../types"

const useAnswerFilters = (): SWRResponse<AnswerFilter[], Error> =>
  useSWR("/api/content/answer-filters")

export default useAnswerFilters
