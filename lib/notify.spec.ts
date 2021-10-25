import {
  notifyApprover,
  notifyNextStep,
  notifyReturnedForEdits,
} from "./notify"
import { NotifyClient } from "notifications-node-client"
import { waitFor } from "@testing-library/react"
import { mockApprover, mockUser } from "../fixtures/users"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import { emailReplyToId } from "../config"

const mockSend = jest.fn()
const mockSessionUser = { ...mockUser, inPilot: true }

jest.mock("notifications-node-client")

beforeEach(() => {
  mockSend.mockClear()
  NotifyClient.mockClear()
})

describe("notifyApprover", () => {
  it("correctly calls the notify client", async () => {
    NotifyClient.mockImplementation(() => {
      return { sendEmail: mockSend }
    })

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
          emailReplyToId,
        }
      )
    })
  })

  it("swallows errors silently", async () => {
    NotifyClient.mockImplementation(() => {
      throw "silent error"
    })

    await notifyApprover(
      mockWorkflowWithExtras,
      mockApprover.email,
      "http://example.com"
    )
  })
})

describe("notifyReturnedForEdits", () => {
  it("correctly calls the notify client", async () => {
    NotifyClient.mockImplementation(() => {
      return { sendEmail: mockSend }
    })

    await notifyReturnedForEdits(
      mockWorkflowWithExtras,
      mockSessionUser,
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
          emailReplyToId,
        }
      )
    })
  })

  it("swallows errors silently", async () => {
    NotifyClient.mockImplementation(() => {
      throw "silent error"
    })

    await notifyReturnedForEdits(
      mockWorkflowWithExtras,
      mockSessionUser,
      "http://example.com",
      "my reason"
    )
  })
})

describe("notifyNextStep", () => {
  it("correctly calls the notify client", async () => {
    NotifyClient.mockImplementation(() => {
      return { sendEmail: mockSend }
    })

    await notifyNextStep(
      mockWorkflowWithExtras,
      "example@email.com",
      "http://example.com",
      "Example note"
    )

    await waitFor(() => {
      expect(mockSend).toBeCalledTimes(1)
      expect(mockSend).toBeCalledWith(
        process.env.NOTIFY_NEXT_STEP_TEMPLATE_ID,
        "example@email.com",
        {
          personalisation: {
            next_step_name: "",
            form_name: "Mock form",
            note: "Example note",
            started_by: "Firstname Surname",
            url: "http://example.com/workflows/123abc",
            resident_social_care_id: "123",
          },
          reference: "123abc-example@email.com",
          emailReplyToId,
        }
      )
    })
  })

  it("swallows errors silently", async () => {
    NotifyClient.mockImplementation(() => {
      throw "silent error"
    })

    expect(
      async () =>
        await notifyNextStep(
          mockWorkflowWithExtras,
          "example@email.com",
          "http://example.com",
          "Example note"
        )
    ).not.toThrow()
  })
})
