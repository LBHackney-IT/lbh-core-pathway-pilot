import { notifyApprover, notifyReturnedForEdits } from "./notify"
import { NotifyClient } from "notifications-node-client"
import { waitFor } from "@testing-library/react"
import { mockApprover, mockUser } from "../fixtures/users"
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
  mockSend.mockClear()
  NotifyClient.mockClear()
})

describe("notifyApprover", () => {
  it("correctly calls the notify client", async () => {
    await notifyApprover(
      mockWorkflowWithExtras,
      mockApprover.email,
      "http://example.com"
    )
    await waitFor(() => {
      expect(mockSend).toBeCalledTimes(1)
      expect(mockSend).toBeCalledWith(
        process.env.NOTIFY_APPROVER_TEMPLATE_ID,
        "firstname.surname@hackney.gov.uk",
        {
          personalisation: {
            form_name: "Mock form",
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
            form_name: "Mock form",
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
