import useSWR, { SWRResponse } from "swr"
import { Resident } from "../types"

export default (socialCareId: string): SWRResponse<Resident, Error> =>
  useSWR(`/api/residents/${socialCareId}`)
