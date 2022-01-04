import { Workflow } from "@prisma/client"
import useSWR, { SWRResponse } from "swr"

const useWorkflowsByResident = (
  socialCareId: string
): SWRResponse<{ workflows: Workflow[] }, Error> =>
  useSWR(`/api/workflows?social_care_id=${socialCareId}&order=desc`)

export default useWorkflowsByResident
