import { Allocation } from "../types"
import fetch from "node-fetch"
/** Get core data about a person by their social care ID */
export const getAllocationsByEmail = async (
  email: string
): Promise<Allocation[] | null> => {
  try {
    const res = await fetch(
      `${process.env.SOCIAL_CARE_API_ENDPOINT}/allocations?worker_email=${email}&status=open`,
      {
        headers: {
          "x-api-key": process.env.SOCIAL_CARE_API_KEY,
        },
      }
    )

    const data = await res.json()

    return data.allocations
    
  } catch (e) {
    return null
  }
}
