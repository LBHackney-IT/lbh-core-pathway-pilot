import useSWR, { SWRResponse } from "swr"
import { Resident } from "../types"

const useResident = (socialCareId: string): SWRResponse<Resident, Error> =>
  useSWR(`/api/residents/${socialCareId}`)

export default useResident
