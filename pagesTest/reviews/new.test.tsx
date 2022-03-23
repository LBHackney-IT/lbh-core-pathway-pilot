import {
  mockAuthorisedWorkflowWithExtras,
  mockWorkflowWithExtras,
  MockWorkflowWithExtras,
} from "../../fixtures/workflows"
import { getServerSideProps, NewReviewPage } from "../../pages/reviews/new"
import { getSession } from "../../lib/auth/session"
import { useRouter } from "next/router"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { csrfFetch } from "../../lib/csrfToken"
import { mockResident } from "../../fixtures/residents"
import useResident from "../../hooks/useResident"
import Layout from "../../components/_Layout"
import {
  mockSession,
  mockSessionNotInPilot,
  mockSessionPanelApprover,
  mockSessionApprover,
} from "../../fixtures/session"
import {
  makeGetServerSidePropsContext,
  testGetServerSidePropsAuthRedirect,
} from "../../lib/auth/test-functions"

jest.mock("../../components/_Layout")
;(Layout as jest.Mock).mockImplementation(({ children }) => <>{children}</>)

jest.mock("../../lib/prisma", () => ({
  workflow: {
    findUnique: jest
      .fn()
      .mockResolvedValue({ ...mockWorkflowWithExtras, nextReview: null }),
  },
}))

jest.mock("../../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)

jest.mock("next/router")

jest.mock("../../lib/csrfToken")
;(csrfFetch as jest.Mock).mockResolvedValue({
  json: jest.fn().mockResolvedValue({ id: "123abc" }),
})

jest.mock("../../hooks/useResident")
;(useResident as jest.Mock).mockReturnValue({ data: mockResident })

describe("getServerSideProps", () => {
  const context = makeGetServerSidePropsContext({
    query: { id: mockWorkflowWithExtras.id },
  })

  testGetServerSidePropsAuthRedirect({
    getServerSideProps,
    tests: [
      {
        name: "user is not in pilot group",
        session: mockSessionNotInPilot,
        redirect: true,
        context,
      },
      {
        name: "user is only an approver",
        session: mockSessionApprover,
        context,
      },
      {
        name: "user is only a panel approver",
        session: mockSessionPanelApprover,
        context,
      },
    ],
  })

  it("returns the previous workflow as props", async () => {
    const response = await getServerSideProps(context)

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({
        id: mockWorkflowWithExtras.id,
      })
    )
  })
})

describe("<NewReviewPage />", () => {
  describe("when a previous workflow needs a reassessment", () => {
    const useRouterPush = jest.fn()

    beforeEach(() => {
      useRouterPush.mockClear()
      ;(csrfFetch as jest.Mock).mockClear()
      ;(useRouter as jest.Mock).mockReturnValue({
        query: {},
        push: useRouterPush,
      })
    })

    it("calls the new workflow API endpoint to create a reassessment", async () => {
      render(<NewReviewPage {...mockAuthorisedWorkflowWithExtras} />)

      fireEvent.click(screen.getByText("Planned"))
      fireEvent.change(
        screen.getByLabelText("When did the reassessment take place?"),
        { target: { value: "2021-11-16" } }
      )
      fireEvent.click(screen.getByText("In person"))
      fireEvent.click(screen.getByText("Continue to task list"))

      await waitFor(() => {
        expect(csrfFetch).toHaveBeenCalledWith(
          "/api/workflows",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              formId: "mock-form",
              socialCareId: "123",
              workflowId: "123abc",
              type: "Reassessment",
              answers: {
                Reassessment: {
                  Type: "Planned",
                  "Other involved professionals": [],
                  "When did the reassessment take place?": "2021-11-16",
                  "How did the reassessment take place?": "In person",
                },
              },
            }),
          })
        )
      })
    })

    it("takes user to task list after submission", async () => {
      render(<NewReviewPage {...mockAuthorisedWorkflowWithExtras} />)

      fireEvent.click(screen.getByText("Planned"))
      fireEvent.change(
        screen.getByLabelText("When did the reassessment take place?"),
        { target: { value: "2021-11-16" } }
      )
      fireEvent.click(screen.getByText("In person"))
      fireEvent.click(screen.getByText("Continue to task list"))

      await waitFor(() => {
        expect(useRouterPush).toHaveBeenCalledWith("/workflows/123abc/steps")
      })
    })
  })

  describe("when an unlinked reassessment", () => {
    const unlinkedReassessment: MockWorkflowWithExtras = {
      ...mockWorkflowWithExtras,
      socialCareId: mockResident.mosaicId,
      type: "Reassessment",
      linkToOriginal: "http://example.com",
    }

    const useRouterPush = jest.fn()

    beforeEach(() => {
      useRouterPush.mockClear()
      ;(csrfFetch as jest.Mock).mockClear()
      ;(useRouter as jest.Mock).mockReturnValue({
        query: { unlinked_reassessment: "true" },
        push: useRouterPush,
      })
    })

    it("calls the update workflow API endpoint to update answers", async () => {
      render(<NewReviewPage {...unlinkedReassessment} />)

      fireEvent.click(screen.getByText("Planned"))
      fireEvent.change(
        screen.getByLabelText("When did the reassessment take place?"),
        { target: { value: "2021-11-16" } }
      )
      fireEvent.click(screen.getByText("In person"))
      fireEvent.click(screen.getByText("Continue to task list"))

      await waitFor(() => {
        expect(csrfFetch).toHaveBeenCalledWith(
          "/api/workflows/123abc",
          expect.objectContaining({
            method: "PATCH",
            body: JSON.stringify({
              answers: {
                Reassessment: {
                  Type: "Planned",
                  "Other involved professionals": [],
                  "When did the reassessment take place?": "2021-11-16",
                  "How did the reassessment take place?": "In person",
                },
              },
            }),
          })
        )
      })
    })

    it("takes user to task list after submission", async () => {
      render(<NewReviewPage {...unlinkedReassessment} />)

      fireEvent.click(screen.getByText("Planned"))
      fireEvent.change(
        screen.getByLabelText("When did the reassessment take place?"),
        { target: { value: "2021-11-16" } }
      )
      fireEvent.click(screen.getByText("In person"))
      fireEvent.click(screen.getByText("Continue to task list"))

      await waitFor(() => {
        expect(useRouterPush).toHaveBeenCalledWith("/workflows/123abc/steps")
      })
    })
  })
})
