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

const submittedAndUnpprovedWorkflow = {
  ...mockWorkflowWithExtras,
  submittedAt: "2021-08-04T10:11:40.593Z",
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
} as unknown as WorkflowForPanel

describe("Header", () => {
  it("displays the name of the resident", () => {
    render(
      <WorkflowPanel
        workflow={{
          ...mockWorkflowWithExtras,
          type: "Review",
        }}
      />
    )

    expect(screen.getByText("Firstname Surname")).toBeInTheDocument()
  })

  it("displays a Review tag if a review", () => {
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

  it("displays a Review tag if a reassessment", () => {
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
})

describe("Meta data - assignment", () => {
  it("shows the workflow is unassigned if no assignee", () => {
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

  it("shows the workflow is assigned if assignee", () => {
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

  it("doesn't show the assignee if submitted workflow", () => {
    render(<WorkflowPanel workflow={submittedAndUnpprovedWorkflow} />)

    expect(
      screen.queryByText("Assigned to", {
        exact: false,
      })
    ).not.toBeInTheDocument()
  })
})

describe("Meta data - on hold", () => {
  it("shows since when the workflow has been on hold if held workflow", () => {
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
})

describe("Meta data - comments", () => {
  it("shows the number of comments", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithExtras} />)

    expect(
      screen.getByText("1 comment", { exact: false })
    ).toBeInTheDocument()
  })
})

describe("Meta data - submitted by", () => {
  it("shows the name of submitter", () => {
    render(<WorkflowPanel workflow={submittedAndUnpprovedWorkflow} />)

    expect(
      screen.getByText("Submitted by Foo Bar", { exact: false })
    ).toBeInTheDocument()
  })

  it("shows when it was submitted", () => {
    render(<WorkflowPanel workflow={submittedAndUnpprovedWorkflow} />)

    expect(
      screen.getByText("on 4 Aug 2021", { exact: false })
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
})

describe("Progress", () => {
  it("shows the percentage of completeness", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithExtras} />)

    expect(screen.getByText("0%")).toBeInTheDocument()
    expect(screen.getByText("In progress")).toBeInTheDocument()
  })
})
