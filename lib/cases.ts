import { Workflow } from ".prisma/client"
import forms from "../config/forms"
import { getResidentById } from "./residents"

/** Add a new record to a case, including person data, the form and the person who wrote it */
export const addRecordToCase = async (
  workflow: Workflow,
  userEmail: string
): Promise<void> => {
  // 1. grab resident data
  const resident = await getResidentById(workflow.socialCareId)

  // 2. grab form
  const formList = await forms()
  const form = formList.find(form => form.id === workflow.formId)

  // 3. add record
  const res = await fetch(`${process.env.SOCIAL_CARE_API_ENDPOINT}/cases`, {
    headers: {
      "x-api-key": process.env.SOCIAL_CARE_API_KEY,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      formName: form.name,
      formNameOverall: "ASC_case_note",
      firstName: resident.firstName,
      lastName: resident.firstName,
      workerEmail: userEmail,
      dateOfBirth: resident.dateOfBirth,
      personId: Number(resident.mosaicId),
      contextFlag: resident.ageContext,
      caseFormData: JSON.stringify({
        case_note_title: form.name,
        case_note_description: JSON.stringify(workflow),
      }),
    }),
  })
  if (res.status !== 201) throw await res.text()
}
