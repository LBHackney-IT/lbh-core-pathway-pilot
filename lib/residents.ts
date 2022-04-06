import { Resident, ResidentFromSCCV } from "../types"
import { SuperResident } from "../components/ResidentDetailsList.types"

/** Get core data about a person by their social care ID */
export const getResidentById = async (id: string): Promise<Resident | null> => {
  try {
    const res = await fetch(
      `${process.env.SOCIAL_CARE_API_ENDPOINT}/residents/${id}`,
      {
        headers: {
          "x-api-key": process.env.SOCIAL_CARE_API_KEY,
        },
      }
    )

    if (res.status === 404) {
      return null
    } else {
      const residentFromSCCV: ResidentFromSCCV = await res.json()

      return {
        mosaicId: String(residentFromSCCV.id),
        firstName: residentFromSCCV.firstName,
        lastName: residentFromSCCV.lastName,
        gender: residentFromSCCV.gender,
        dateOfBirth: residentFromSCCV.dateOfBirth || null,
        nhsNumber: residentFromSCCV.nhsNumber
          ? String(residentFromSCCV.nhsNumber)
          : null,
        ageContext: residentFromSCCV.contextFlag,
        restricted: residentFromSCCV.restricted,
        addressList: residentFromSCCV.address
          ? [
              {
                addressLine1: residentFromSCCV.address?.address,
                postCode: residentFromSCCV.address?.postcode,
              },
            ]
          : [],
        phoneNumber: residentFromSCCV.phoneNumbers.map(phoneNumber => ({
          phoneNumber: phoneNumber.number,
          phoneType: phoneNumber.type,
        })),
        ethnicity: residentFromSCCV.ethnicity || null,
        firstLanguage: residentFromSCCV.firstLanguage || null,
        religion: residentFromSCCV.religion || null,
        sexualOrientation: residentFromSCCV.sexualOrientation || null,
        emailAddress: residentFromSCCV.emailAddress || null,
        preferredMethodOfContact:
          residentFromSCCV.preferredMethodOfContact || null,
        otherNames: residentFromSCCV.otherNames.map(otherName => ({
          firstName: otherName.firstName,
          lastName: otherName.lastName,
        })),
      }
    }
  } catch (e) {
    return null
  }
}

export const getSuperResidentById = async (
  id: string
): Promise<SuperResident | null> => {
  try {
    const res = await fetch(
      `${process.env.SOCIAL_CARE_API_ENDPOINT}/residents/${id}`,
      {
        headers: {
          "x-api-key": process.env.SOCIAL_CARE_API_KEY,
        },
      }
    )

    if (res.status === 404) {
      return null
    } else {
      return await res.json()
    }
  } catch (e) {
    return null
  }
}
