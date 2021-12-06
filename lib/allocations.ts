import { Allocation } from "../types"

/** Get core data about a person by their social care ID */
export const getAllocationsByEmail = async (
  email: string
): Promise<Allocation[] | null> => {
  try {
    const res = await fetch(
      `${process.env.SOCIAL_CARE_API_ENDPOINT}/allocations?worker_email=${email}`,
      {
        headers: {
          "x-api-key": process.env.SOCIAL_CARE_API_KEY,
        },
      }
    )

    const data = await res.json()

    return data.allocations

    if (res.status === 404) {
      return null
    } else {
      return await res.json()
    }
  } catch (e) {
    return null
  }
}
