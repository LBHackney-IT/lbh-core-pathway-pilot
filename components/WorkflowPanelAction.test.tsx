import { render, screen } from "@testing-library/react"
import { useSession } from "next-auth/client"
import { useRouter } from "next/router"
import { mockUser } from "../fixtures/users"
import { mockWorkflow, MockWorkflowWithExtras } from "../fixtures/workflows"
import WorkflowPanelAction from "./WorkflowPanelAction"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

jest.mock("next-auth/client")
;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }, false])

describe("WorkflowPanelAction", () => {
  it("shows a resume button for an in-progress workflow", () => {
    render(<WorkflowPanelAction workflow={mockWorkflow as MockWorkflowWithExtras} />)

    expect(screen.getByText("Resume"))
  })

  it("shows a review button for a finished workflow", () => {
    render(
      <WorkflowPanelAction
        workflow={
          {
            ...mockWorkflow,
            panelApprovedAt: new Date(),
          } as MockWorkflowWithExtras
        }
      />
    )

    expect(screen.getByText("Start reassessment"))
  })

  it("shows a next reassessment button for an already reassessed workflow", () => {
    render(
      <WorkflowPanelAction
        workflow={
          {
            ...mockWorkflow,
            nextReview: mockWorkflow,
          } as MockWorkflowWithExtras
        }
      />
    )

    expect(screen.getByText("See next reassessment"))
  })

  it("shows a resume button for an in-progress workflow", () => {
    render(
      <WorkflowPanelAction
        workflow={
          {
            ...mockWorkflow,
          } as MockWorkflowWithExtras
        }
      />
    )

    expect(screen.getByText("Resume"))
  })

  it("shows a view button for a workflow that has been submitted", () => {
    render(
      <WorkflowPanelAction
        workflow={
          {
            ...mockWorkflow,
            submittedAt: new Date(),
            submittedBy: "test@example.com",
          } as MockWorkflowWithExtras
        }
      />
    )

    expect(screen.getByText("View"))
  })
})
