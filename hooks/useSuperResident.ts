import useSWR, { SWRResponse } from "swr"
import { SuperResident } from "../components/ResidentDetailsList.types"

const useSuperResident = (socialCareId: string): SWRResponse<SuperResident, Error> =>
  useSWR(`/api/superresidents/${socialCareId}`)

export default useSuperResident
