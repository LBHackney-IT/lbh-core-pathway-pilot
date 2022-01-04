import { Workflow } from "@prisma/client"
import useSWR, { SWRResponse } from "swr"

const useWorkflowsByResident = (
  socialCareId: string
): SWRResponse<Workflow[], Error> =>
  useSWR(`/api/workflows?social_care_id=${socialCareId}`)

export default useWorkflowsByResident
