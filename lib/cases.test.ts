import { mockSubmittedWorkflowWithExtras } from "../fixtures/workflows"
import { mockResident } from "../fixtures/residents";
import { addRecordToCase } from "./cases"
import fetch from 'node-fetch'
import { getResidentById } from './residents';
import {mockForm} from "../fixtures/form";

jest.mock('node-fetch')

;(fetch as unknown as jest.Mock)
  .mockReturnValueOnce({ status: 201, text: "example text" })
  .mockReturnValueOnce({ status: 500, text: "example text" })

jest.mock('./residents')

;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

describe("cases", () => {
  it("adds a new record correctly", async () => {
    await addRecordToCase(mockSubmittedWorkflowWithExtras)

    expect(fetch).toBeCalledWith(
      `${process.env.SOCIAL_CARE_API_ENDPOINT}/cases`,
      {
        headers: expect.anything(),
        method: "POST",
        body: JSON.stringify({
          formName: mockForm.name,
          formNameOverall: "ASC_case_note",
          firstName: mockResident.firstName,
          lastName: mockResident.lastName,
          workerEmail: mockSubmittedWorkflowWithExtras.submittedBy,
          dateOfBirth: mockResident.dateOfBirth,
          personId: Number(mockResident.mosaicId),
          contextFlag: mockResident.ageContext,
          caseFormData: JSON.stringify({
            workflowId: mockSubmittedWorkflowWithExtras.id,
          }),
        }),
      }
    )
  })

  it("correctly handles errors", async () => {
    await expect(addRecordToCase(mockSubmittedWorkflowWithExtras)).rejects.toThrow()
  })
})
