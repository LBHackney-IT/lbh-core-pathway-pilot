import useSWR, { SWRResponse } from "swr"
import { NextStepOption } from "../types"

const useNextSteps = (): SWRResponse<NextStepOption[], Error> =>
  useSWR("/api/content/next-steps")

export default useNextSteps
