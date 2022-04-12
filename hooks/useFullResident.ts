import useSWR, { SWRResponse } from "swr"
import { FullResident } from "../components/ResidentDetailsList.types"

const useFullResident = (socialCareId: string): SWRResponse<FullResident, Error> =>
  useSWR(`/api/residents/${socialCareId}?fullView=true`)

export default useFullResident
