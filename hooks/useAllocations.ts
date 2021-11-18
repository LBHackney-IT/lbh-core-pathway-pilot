import useSWR, { SWRResponse } from "swr"
import { Allocation } from "../types"

const useAllocations = (email: string): SWRResponse<Allocation[], Error> =>
  useSWR(`/api/allocations/${email}`)

export default useAllocations
