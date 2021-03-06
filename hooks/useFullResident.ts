import useSWR, { SWRResponse } from "swr"
import { FullResident } from "../components/ResidentDetailsList.types"

const useFullResident = (socialCareId: string, workflowId?: string): SWRResponse<FullResident, Error> =>
  useSWR(`/api/residents/${socialCareId}?view=full${workflowId ? `&workflowId=${workflowId}` : ''}`)

export default useFullResident
