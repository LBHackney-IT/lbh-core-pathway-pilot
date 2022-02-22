import useSWR, { SWRResponse } from "swr"
import { AnswerFilter } from "../types"

const useAnswerFilters = (): SWRResponse<
  { answerFilters: AnswerFilter[] },
  Error
> => useSWR("/api/content/filters")

export default useAnswerFilters
