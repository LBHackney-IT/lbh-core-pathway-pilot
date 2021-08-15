import { notifyReturnedForEdits } from "./notify"
import { NotifyClient } from "notifications-node-client"
import { waitFor } from "@testing-library/react"
import { mockUser } from "../fixtures/users"
import { mockWorkflowWithExtras } from "../fixtures/workflows"

const mockSend = jest.fn()

jest.mock("notifications-node-client", () => {
  return {
    NotifyClient: jest.fn().mockImplementation(() => {
      return { sendEmail: mockSend }
    }),
  }
})

beforeEach(() => {
  NotifyClient.mockClear()
})

// describe("notifyApprover", () => {
//   it("correctly calls the notify client", async () => {
//     await notifyApprover(mockSubmission, "bar", "http://example.com")
//     await waitFor(() => {
//       expect(mockSend).toBeCalledTimes(1)
//       expect(mockSend).toBeCalledWith(
//         process.env.NOTIFY_APPROVER_TEMPLATE_ID,
//         "bar",
//         {
//           personalisation: {
//             form_name: "Sandbox form",
//             resident_name: "Foo Bar",
//             resident_social_care_id: "1",
//             started_by: "foo.bar@hackney.gov.uk",
//             url: "http://example.com/people/1/submissions/123",
//           },
//           reference: "123-bar",
//         }
//       )
//     })
//   })
// })

describe("notifyReturnedForEdits", () => {
  it("correctly calls the notify client", async () => {
    await notifyReturnedForEdits(
      mockWorkflowWithExtras,
      mockUser,
      "http://example.com",
      "my reason"
    )
    await waitFor(() => {
      expect(mockSend).toBeCalledTimes(1)
      expect(mockSend).toBeCalledWith(
        process.env.NOTIFY_RETURN_FOR_EDITS_TEMPLATE_ID,
        "firstname.surname@hackney.gov.uk",
        {
          personalisation: {
            rejector: "Firstname Surname",
            reason: "my reason",
            form_name: "Care act assessment",
            started_by: "Firstname Surname",
            url: "http://example.com/workflows/123abc",
            resident_social_care_id: "123",
          },
          reference: "123abc-firstname.surname@hackney.gov.uk",
        }
      )
    })
  })
})
