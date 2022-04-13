import {Allocation} from "../types"
import fetch from "node-fetch"

/** Get core data about a person by their social care ID */
export const getAllocationsByEmail = async (
  email: string
): Promise<Allocation[] | null> => {
  try {
    const workerResponse = await fetch(
      `${process.env.SOCIAL_CARE_API_ENDPOINT}/workers?email=${email}`,
      {
        headers: {
          "x-api-key": process.env.SOCIAL_CARE_API_KEY,
        },
      },
    );

    const workerData = await workerResponse.json()

    const allocationsResponse = await fetch(
      `${process.env.SOCIAL_CARE_API_ENDPOINT}/allocations?worker_id=${workerData?.[0].id}&status=open`,
      {
        headers: {
          "x-api-key": process.env.SOCIAL_CARE_API_KEY,
        },
      }
    )

    const allocationsData = await allocationsResponse.json()

    return allocationsData.allocations
  } catch (e) {
    return null
  }
}
