import { render, screen } from "@testing-library/react"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import WorkflowPanel, { WorkflowForPanel } from "./WorkflowPanel"
import swr from "swr"
import { mockResident } from "../fixtures/residents"
import { useSession } from "next-auth/client"
import { mockUser } from "../fixtures/users"

jest.mock("next-auth/client")
;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }, false])

jest.mock("swr")
;(swr as jest.Mock).mockReturnValue({
  data: mockResident,
})

global.fetch = jest.fn()

describe("WorkflowPanel", () => {
  it("calls the hook correctly", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithExtras} />)

    expect(swr).toBeCalledWith("/api/residents/123")
  })

  it("shows an unassigned workflow correctly", () => {
    render(
      <WorkflowPanel
        workflow={{
          ...mockWorkflowWithExtras,
          assignedTo: null,
          assignee: null,
        }}
      />
    )

    expect(screen.getByText("Firstname Surname")).toBeInTheDocument()
    expect(
      screen.getByText("Started by Firstname Surname · Unassigned", {
        exact: false,
      })
    ).toBeInTheDocument()
  })

  it("shows an assigned workflow correctly", () => {
    render(
      <WorkflowPanel
        workflow={{ ...mockWorkflowWithExtras, submitter: null }}
      />
    )

    expect(screen.getByText("Firstname Surname")).toBeInTheDocument()
    expect(
      screen.getByText("Assigned to Firstname Surname", { exact: false })
    ).toBeInTheDocument()
  })

  it("shows a held workflow correctly", () => {
    render(
      <WorkflowPanel
        workflow={
          {
            ...mockWorkflowWithExtras,
            heldAt: "2021-08-04T10:11:40.593Z",
          } as unknown as WorkflowForPanel
        }
      />
    )

    expect(
      screen.getByText("Held since 4 Aug 2021", { exact: false })
    ).toBeInTheDocument()
  })

  it("indicates progress", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithExtras} />)

    expect(screen.getByText("0%")).toBeInTheDocument()
    expect(screen.getByText("In progress")).toBeInTheDocument()
  })

  it("displays reviews differently", () => {
    render(
      <WorkflowPanel
        workflow={{
          ...mockWorkflowWithExtras,
          type: "Review",
        }}
      />
    )

    expect(screen.getByText("Review")).toBeInTheDocument()
  })

  it("displays reassessments differently", () => {
    render(
      <WorkflowPanel
        workflow={{
          ...mockWorkflowWithExtras,
          type: "Reassessment",
        }}
      />
    )

    expect(screen.getByText("Reassessment")).toBeInTheDocument()
  })

  it("doesn't show submitter if unsubmitted workflow", () => {
    render(
      <WorkflowPanel
        workflow={{ ...mockWorkflowWithExtras, submitter: null }}
      />
    )

    expect(
      screen.queryByText("Submitted by", {
        exact: false,
      })
    ).not.toBeInTheDocument()
  })

  describe("when a workflow is submitted and unapproved", () => {
    const submittedAndUnpprovedWorkflow = {
      ...mockWorkflowWithExtras,
      submittedAt: new Date(),
      submittedBy: "submitted.by@hackney.gov.uk",
      submitter: {
        ...mockUser,
        name: "Foo Bar",
        email: "submitted.by@hackney.gov.uk",
      },
      managerApprovedAt: null,
      managerApprovedBy: null,
      panelApprovedAt: null,
      panelApprovedBy: null,
    } as WorkflowForPanel

    it("shows the name of submitter", () => {
      render(<WorkflowPanel workflow={submittedAndUnpprovedWorkflow} />)

      expect(
        screen.getByText("Submitted by Foo Bar", { exact: false })
      ).toBeInTheDocument()
    })

    it("shows the email of submitter if a name isn't available", () => {
      render(
        <WorkflowPanel
          workflow={{
            ...submittedAndUnpprovedWorkflow,
            submitter: {
              ...mockUser,
              name: null,
              email: "submitted.by@hackney.gov.uk",
            },
          }}
        />
      )

      expect(
        screen.getByText("Submitted by submitted.by@hackney.gov.uk", {
          exact: false,
        })
      ).toBeInTheDocument()
    })

    it("doesn't show the assignee", () => {
      render(<WorkflowPanel workflow={submittedAndUnpprovedWorkflow} />)

      expect(
        screen.queryByText("Assigned to", {
          exact: false,
        })
      ).not.toBeInTheDocument()
    })
  })
})
