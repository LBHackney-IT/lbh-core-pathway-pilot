import { render, screen } from "@testing-library/react"
import { useSession } from "next-auth/client"
import { useRouter } from "next/router"
import { mockUser } from "../fixtures/users"
import { mockWorkflow, MockWorkflowWithExtras } from "../fixtures/workflows"
import WorkflowPanelAction from "./WorkflowPanelAction"
import { getStatus } from "../lib/status"
import { Status } from "../types"

jest.mock("../lib/status")
;(getStatus as jest.Mock).mockReturnValue(Status.InProgress)

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

jest.mock("next-auth/client")
;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }, false])

describe("WorkflowPanelAction", () => {
  beforeEach(() => {
    ;(getStatus as jest.Mock).mockClear()
  })

  it("shows a resume button for an in-progress workflow", () => {
    ;(getStatus as jest.Mock).mockReturnValue(Status.InProgress)

    render(
      <WorkflowPanelAction workflow={mockWorkflow as MockWorkflowWithExtras} />
    )

    expect(screen.getByText("Resume"))
  })

  it("shows a review button for a finished workflow", () => {
    ;(getStatus as jest.Mock).mockReturnValue(Status.NoAction)

    render(
      <WorkflowPanelAction workflow={mockWorkflow as MockWorkflowWithExtras} />
    )

    expect(screen.getByText("Start reassessment"))
  })

  it("shows a review button for a review due soon workflow", () => {
    ;(getStatus as jest.Mock).mockReturnValue(Status.ReviewSoon)

    render(
      <WorkflowPanelAction workflow={mockWorkflow as MockWorkflowWithExtras} />
    )

    expect(screen.getByText("Start reassessment"))
  })

  it("shows a review button for an overdue workflow", () => {
    ;(getStatus as jest.Mock).mockReturnValue(Status.Overdue)

    render(
      <WorkflowPanelAction workflow={mockWorkflow as MockWorkflowWithExtras} />
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

  it("shows a view button for a workflow that has been submitted", () => {
    ;(getStatus as jest.Mock).mockReturnValue(Status.Submitted)

    render(
      <WorkflowPanelAction workflow={mockWorkflow as MockWorkflowWithExtras} />
    )

    expect(screen.getByText("View"))
  })

  it("shows a view button for a workflow that has been approved", () => {
    ;(getStatus as jest.Mock).mockReturnValue(Status.ManagerApproved)

    render(
      <WorkflowPanelAction workflow={mockWorkflow as MockWorkflowWithExtras} />
    )

    expect(screen.getByText("View"))
  })

  it("links to the confirm personal details page for a finished workflow", () => {
    ;(getStatus as jest.Mock).mockReturnValue(Status.NoAction)

    render(
      <WorkflowPanelAction workflow={mockWorkflow as MockWorkflowWithExtras} />
    )

    expect(screen.getByText("Start reassessment")).toHaveAttribute(
      "href",
      `/workflows/${mockWorkflow.id}/confirm-personal-details`
    )
  })

  it("links to the confirm personal details page for a review due soon workflow", () => {
    ;(getStatus as jest.Mock).mockReturnValue(Status.ReviewSoon)

    render(
      <WorkflowPanelAction workflow={mockWorkflow as MockWorkflowWithExtras} />
    )

    expect(screen.getByText("Start reassessment")).toHaveAttribute(
      "href",
      `/workflows/${mockWorkflow.id}/confirm-personal-details`
    )
  })

  it("links to the confirm personal details page for an overdue workflow", () => {
    ;(getStatus as jest.Mock).mockReturnValue(Status.Overdue)

    render(
      <WorkflowPanelAction workflow={mockWorkflow as MockWorkflowWithExtras} />
    )

    expect(screen.getByText("Start reassessment")).toHaveAttribute(
      "href",
      `/workflows/${mockWorkflow.id}/confirm-personal-details`
    )
  })
})
