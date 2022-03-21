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
import { WorkflowType } from "@prisma/client"
import useWorkflowsByResident from "../../hooks/useWorkflowsByResident"

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

jest.mock("../../hooks/useWorkflowsByResident")
;(useWorkflowsByResident as jest.Mock).mockReturnValue({
  data: {
    workflows: [mockWorkflow],
  },
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

  it("returns the resident, forms and workflow types as props", async () => {
    const response = await getServerSideProps(context)

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({
        resident: mockResident,
        forms: [mockForm],
        workflowTypes: ["Assessment", "Review", "Reassessment", "Historic"],
      })
    )
  })
})

describe("<NewWorkflowPage />", () => {
  const mockInitialContactAssessment = {
    ...mockForm,
    id: screeningFormId,
    name: "Initial contact assessment",
  }

  const forms = [mockForm, mockInitialContactAssessment]

  describe("when an unlinked reassessment", () => {
    const mockWorkflowType = "Mock" as WorkflowType

    const useRouterPush = jest.fn()

    beforeEach(() => {
      useRouterPush.mockClear()
      ;(useRouter as jest.Mock).mockReturnValue({
        query: { unlinked_reassessment: "true" },
        push: useRouterPush,
      })
    })

    it("asks what kind of reassessment this is as the main heading", async () => {
      render(
        <NewWorkflowPage
          resident={mockResident}
          forms={forms}
          workflowTypes={[mockWorkflowType]}
        />
      )

      expect(
        screen.getByText("What type of reassessment do you want to start?")
      ).toBeVisible()
    })

    it("does not include initial contact assessment as an option for reassessment", async () => {
      render(
        <NewWorkflowPage
          resident={mockResident}
          forms={forms}
          workflowTypes={[mockWorkflowType]}
        />
      )

      expect(screen.getByText("Mock form")).toBeVisible()
      expect(screen.queryByText("Initial contact assessment")).toBeNull()
    })

    it("displays warning about creating an unlinked reassessment", async () => {
      render(
        <NewWorkflowPage
          resident={mockResident}
          forms={forms}
          workflowTypes={[mockWorkflowType]}
        />
      )

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
      render(
        <NewWorkflowPage
          resident={mockResident}
          forms={forms}
          workflowTypes={[mockWorkflowType]}
        />
      )

      expect(screen.getByText("Where is the previous workflow?")).toBeVisible()
    })

    it("takes the user to the confirm personal details page with unlinked_reassessment set to true as a query param, after submission", async () => {
      render(
        <NewWorkflowPage
          resident={mockResident}
          forms={forms}
          workflowTypes={[mockWorkflowType]}
        />
      )

      fireEvent.click(screen.getByText("Mock form"))
      fireEvent.click(screen.getByText("Continue"))

      await waitFor(() => {
        expect(useRouterPush).toHaveBeenCalledWith(
          "/workflows/123abc/confirm-personal-details?unlinked_reassessment=true"
        )
      })
    })
  })

  describe("when a starting a new workflow", () => {
    const useRouterPush = jest.fn()
    const workflowTypes: WorkflowType[] = [
      "Assessment",
      "Review",
      "Reassessment",
      "Historic",
    ]

    beforeEach(() => {
      useRouterPush.mockClear()
      ;(useRouter as jest.Mock).mockReturnValue({
        query: {},
        push: useRouterPush,
      })
    })

    it("displays 'Start a new workflow' as the main heading", async () => {
      render(
        <NewWorkflowPage
          resident={mockResident}
          forms={forms}
          workflowTypes={workflowTypes}
        />
      )

      expect(screen.getByText("Start a new workflow")).toBeVisible()
    })

    it("displays all valid workflow type options", async () => {
      render(
        <NewWorkflowPage
          resident={mockResident}
          forms={forms}
          workflowTypes={workflowTypes}
        />
      )

      expect(screen.getByText("What do you want to do?")).toBeVisible()
      expect(screen.getByText("Start a new assessment")).toBeVisible()
      expect(screen.getByText("Start a review")).toBeVisible()
      expect(screen.getByText("Start a reassessment")).toBeVisible()
    })

    it("does not display 'Start new historic' as a valid option", async () => {
      render(
        <NewWorkflowPage
          resident={mockResident}
          forms={forms}
          workflowTypes={workflowTypes}
        />
      )

      expect(screen.queryByText("Start a historic")).toBeNull()
    })

    it("shows the list of assessments, when a user clicks on start new assessment option", async () => {
      render(
        <NewWorkflowPage
          resident={mockResident}
          forms={forms}
          workflowTypes={workflowTypes}
        />
      )

      fireEvent.click(screen.getByText("Start a new assessment"))
      await waitFor(() => {
        expect(
          screen.getByText("What type of assessment do you want to start?")
        )
        expect(screen.getByText("Mock form")).toBeVisible()
        expect(screen.getByText("Initial contact assessment")).toBeVisible()
      })
    })

    it("doesn't display warning about creating an unlinked reassessment", async () => {
      render(
        <NewWorkflowPage
          resident={mockResident}
          forms={forms}
          workflowTypes={workflowTypes}
        />
      )

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

    it("takes user to the confirm personal details page without unlinked_reassessment query param in the URL, after submission", async () => {
      render(
        <NewWorkflowPage
          resident={mockResident}
          forms={forms}
          workflowTypes={workflowTypes}
        />
      )

      fireEvent.click(screen.getByText("Start a new assessment"))
      fireEvent.click(screen.getByText("Mock form"))
      fireEvent.click(screen.getByText("Continue"))

      await waitFor(() => {
        expect(useRouterPush).toHaveBeenCalledWith(
          "/workflows/123abc/confirm-personal-details"
        )
      })
    })

    it("shows review questions, when a user clicks on start a review option", async () => {
      render(
        <NewWorkflowPage
          resident={mockResident}
          forms={forms}
          workflowTypes={workflowTypes}
        />
      )

      fireEvent.click(screen.getByText("Start a review"))
      await waitFor(() => {
        expect(screen.getByText("What workflow do you want to review?"))
        expect(
          screen.getByText(
            "Do you have the link to the workflow that you want to review?"
          )
        )
        expect(
          screen.queryByText("What type of assessment do you want to start?")
        ).toBeNull()
      })
    })

    it("takes user to the confirm personal details page, after selecting start a review option and submitting", async () => {
      render(
        <NewWorkflowPage
          resident={mockResident}
          forms={forms}
          workflowTypes={workflowTypes}
        />
      )

      fireEvent.click(screen.getByText("Start a review"))
      fireEvent.click(screen.getByText("None"))
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: mockWorkflow.id },
      })

      fireEvent.click(screen.getByText("Continue"))

      await waitFor(() => {
        expect(useRouterPush).toHaveBeenCalledWith(
          "/workflows/123abc/confirm-personal-details"
        )
      })
    })

    it("shows reassessment questions when a user clicks on reassessment option", async () => {
      render(
        <NewWorkflowPage
          resident={mockResident}
          forms={forms}
          workflowTypes={workflowTypes}
        />
      )

      fireEvent.click(screen.getByText("Start a reassessment"))
      await waitFor(() => {
        expect(screen.getByText("What workflow do you want to reassess?"))
        expect(
          screen.getByText(
            "Do you have the link to the workflow that you want to reassess?"
          )
        )
        expect(
          screen.queryByText("What workflow do you want to review?")
        ).toBeNull()
        expect(
          screen.queryByText("What type of assessment do you want to start?")
        ).toBeNull()
      })
    })

    it("takes user to the confirm personal details page, after selecting start a reassessment option and submitting", async () => {
      render(
        <NewWorkflowPage
          resident={mockResident}
          forms={forms}
          workflowTypes={workflowTypes}
        />
      )

      fireEvent.click(screen.getByText("Start a reassessment"))
      fireEvent.click(screen.getByText("None"))
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: mockWorkflow.id },
      })

      fireEvent.click(screen.getByText("Continue"))

      await waitFor(() => {
        expect(useRouterPush).toHaveBeenCalledWith(
          "/workflows/123abc/confirm-personal-details"
        )
      })
    })
  })
})
