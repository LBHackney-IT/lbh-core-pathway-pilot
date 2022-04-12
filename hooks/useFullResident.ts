import useSWR, { SWRResponse } from "swr"
import { FullResident } from "../components/ResidentDetailsList.types"

//Change to fullResident
//Change to one api that takes in a parameter
//Answer filters - look at this - might be useful for conditionally showing - Frontend as reference material
const useFullResident = (socialCareId: string): SWRResponse<FullResident, Error> =>
  useSWR(`/api/superresidents/${socialCareId}`)

export default useFullResident
