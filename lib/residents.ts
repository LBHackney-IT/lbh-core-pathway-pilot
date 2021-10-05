import { Resident } from "../types"

/** Get core data about a person by their social care ID */
export const getResidentById = async (id: string): Promise<Resident | null> => {
  try {
    const res = await fetch(
      `${process.env.SOCIAL_CARE_API_ENDPOINT}/residents?id=${id}`,
      {
        headers: {
          "x-api-key": process.env.SOCIAL_CARE_API_KEY,
        },
      }
    )
    const data = await res.json()
    const resident = data.residents?.find(
      resident => resident.mosaicId === String(id)
    )
    if (!resident) return null
    return resident
  } catch (e) {
    return null
  }
}
