import { mockResident } from "../fixtures/residents"
import { mockUser } from "../fixtures/users"
import { mockWorkflow } from "../fixtures/workflows"
import { addRecordToCase } from "./cases"

global.fetch = jest
  .fn()
  .mockReturnValueOnce({ status: 201, text: "example text" })
  .mockReturnValueOnce({ status: 500, text: "example text" })

describe("cases", () => {
  // it("adds a new record correctly", async () => {
  //   await addRecordToCase(mockWorkflow, mockUser.email)

  //   expect(fetch).toBeCalledWith(
  //     `${process.env.SOCIAL_CARE_API_ENDPOINT}/cases`,
  //     {
  //       headers: expect.anything(),
  //       method: "POST",
  //       body: JSON.stringify({
  //         formName: "foo",
  //         formNameOverall: "ASC_case_note",
  //         firstName: mockResident.firstName,
  //         lastName: mockResident.firstName,
  //         workerEmail: mockUser.email,
  //         dateOfBirth: mockResident.dateOfBirth,
  //         personId: Number(mockResident.mosaicId),
  //         contextFlag: mockResident.ageContext,
  //         caseFormData: JSON.stringify({
  //           case_note_title: "foo",
  //           case_note_description: JSON.stringify({
  //             foo: "bar",
  //           }),
  //         }),
  //       }),
  //     }
  //   )
  // })

  it("correctly handles errors", async () => {
    await expect(
      addRecordToCase(mockWorkflow, mockUser.email)
    ).rejects.toThrow()
  })
})
