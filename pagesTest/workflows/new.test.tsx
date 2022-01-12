import { mockForm } from "../../fixtures/form"
import { mockResident } from "../../fixtures/residents"
import { mockWorkflow, mockWorkflowWithExtras } from "../../fixtures/workflows"
import { getResidentById } from "../../lib/residents"
import NewWorkflowPage, { getServerSideProps } from "../../pages/workflows/new"
import { getSession } from "../../lib/auth/session"
import { useRouter } from "next/router"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import Layout from "../../components/_Layout"
import { screeningFormId } from "../../config"
import { csrfFetch } from "../../lib/csrfToken"
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

jest.mock("../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn().mockResolvedValue(mockWorkflowWithExtras),
    update: jest.fn(),
  },
}))

jest.mock("../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("../../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)

jest.mock("next/router")

jest.mock("../../components/_Layout")
;(Layout as jest.Mock).mockImplementation(({ children }) => <>{children}</>)

jest.mock("../../lib/csrfToken")
;(csrfFetch as jest.Mock).mockResolvedValue({
  json: jest.fn().mockResolvedValue(mockWorkflow),
})

describe("pages/workflows/new.getServerSideProps", () => {
  const context = makeGetServerSidePropsContext({})

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

  it("returns the resident and forms as props", async () => {
    const response = await getServerSideProps(context)

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({
        resident: mockResident,
        forms: [mockForm],
      })
    )
  })
})

describe("<NewWorkflowPage />", () => {
  const forms = [
    mockForm,
    { ...mockForm, id: screeningFormId, name: "Screening assessment" },
  ]

  describe("when an unlinked reassessment", () => {
    const useRouterPush = jest.fn()

    beforeEach(() => {
      useRouterPush.mockClear()
      ;(useRouter as jest.Mock).mockReturnValue({
        query: { unlinked_reassessment: "true" },
        push: useRouterPush,
      })
    })

    it("displays reassessment as the main heading", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(
        screen.getByText("What kind of reassessment is this?")
      ).toBeVisible()
    })

    it("displays form type options without screening assessment", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(screen.getByText("Mock form")).toBeVisible()
      expect(screen.queryByText("Screening assessment")).toBeNull()
    })

    it("displays warning about creating an unlinked reassessment", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(
        screen.getByText(
          "You're about to create a reassessment that isn't linked to an existing workflow."
        )
      ).toBeVisible()
      expect(
        screen.getByText(
          "Only continue if you're sure the previous workflow exists but hasn't been imported."
        )
      ).toBeVisible()
    })

    it("asks where the previous workflow is", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(screen.getByText("Where is the previous workflow?")).toBeVisible()
    })

    it("takes user to confirm personal details with unlinked_reassessment query param after submission", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      fireEvent.click(screen.getByText("Mock form"))
      fireEvent.click(screen.getByText("Continue"))

      await waitFor(() => {
        expect(useRouterPush).toHaveBeenCalledWith(
          "/workflows/123abc/confirm-personal-details?unlinked_reassessment=true"
        )
      })
    })
  })

  describe("when a new assessment", () => {
    const useRouterPush = jest.fn()

    beforeEach(() => {
      useRouterPush.mockClear()
      ;(useRouter as jest.Mock).mockReturnValue({
        query: {},
        push: useRouterPush,
      })
    })

    it("displays assessment as the main heading", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(screen.getByText("What kind of assessment is this?")).toBeVisible()
    })

    it("displays all form type options", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(screen.getByText("Mock form")).toBeVisible()
      expect(screen.getByText("Screening assessment")).toBeVisible()
    })

    it("doesn't display warning about creating an unlinked reassessment", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(
        screen.queryByText(
          "You're about to create a reassessment that isn't linked to an existing workflow."
        )
      ).toBeNull()
      expect(
        screen.queryByText(
          "Only continue if you're sure the previous workflow exists but hasn't been imported."
        )
      ).toBeNull()
    })

    it("asks where the previous workflow is", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      expect(screen.getByText("Where is the previous workflow?"))
    })

    it("takes user to confirm personal details without unlinked_reassessment query param after submission", async () => {
      render(<NewWorkflowPage resident={mockResident} forms={forms} />)

      fireEvent.click(screen.getByText("Mock form"))
      fireEvent.click(screen.getByText("Continue"))

      await waitFor(() => {
        expect(useRouterPush).toHaveBeenCalledWith(
          "/workflows/123abc/confirm-personal-details"
        )
      })
    })
  })
})
