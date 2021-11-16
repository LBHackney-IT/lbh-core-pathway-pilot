import { Resident } from "../types"

/** Add a new record to a case, including person data, the form and the person who wrote it */
export const addRecordToCase = async (
  data: any,
  resident: Resident,
  userEmail: string,
  formName: string
): Promise<void> => {
  const res = await fetch(`${process.env.SOCIAL_CARE_API_ENDPOINT}/cases`, {
    headers: {
      "x-api-key": process.env.SOCIAL_CARE_API_KEY,
      "Content-Type": "application/json",
    },
    method: "POST",
    // TODO: what should these values be?
    body: JSON.stringify({
      formName: formName,
      formNameOverall: "ASC_case_note",
      firstName: resident.firstName,
      lastName: resident.firstName,
      workerEmail: userEmail,
      dateOfBirth: resident.dateOfBirth,
      personId: Number(resident.mosaicId),
      contextFlag: resident.ageContext,
      caseFormData: JSON.stringify({
        case_note_title: formName,
        case_note_description: JSON.stringify(data),
      }),
    }),
  })
  if (res.status !== 201) throw await res.text()
}
