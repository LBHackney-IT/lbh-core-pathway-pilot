import { render, screen } from "@testing-library/react"
import MilestoneTimeline, {
  WorkflowForMilestoneTimeline,
} from "./MilestoneTimeline"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import { mockRevisionWithActor } from "../fixtures/revisions"
import { Workflow } from "@prisma/client"

const mockWorkflowWithRevisions = {
  ...mockWorkflowWithExtras,
  workflowId: null,
  revisions: [],
}

describe("MilestoneTimeline", () => {
  it("shows a brand new workflow correctly", () => {
    render(<MilestoneTimeline workflow={mockWorkflowWithRevisions} />)
    expect(screen.getAllByRole("listitem").length).toBe(2)
    expect(screen.getByText("Started by Firstname Surname"))
  })

  const mockData = {
    ...mockWorkflowWithExtras,
    workflowId: null,
    revisions: [
      mockRevisionWithActor,
      mockRevisionWithActor,
      mockRevisionWithActor,
    ],
  }

  it("shows an edited workflow correctly", () => {
    render(<MilestoneTimeline workflow={mockData} />)
    expect(screen.getAllByRole("listitem").length).toBe(3)
    expect(screen.getByText("Edited by Firstname Surname"))
    expect(screen.getByText("Started by Firstname Surname"))
  })

  it("shows a review correctly", () => {
    render(
      <MilestoneTimeline
        workflow={{
          ...mockWorkflowWithExtras,
          workflowId: "123abc",
          previousReview: {
            id: "abc123",
          } as Workflow,
        }}
      />
    )
    expect(screen.getAllByRole("listitem").length).toBe(3)
    expect(screen.getByText("Edited by Firstname Surname"))
    expect(screen.getByText("Review started by Firstname Surname"))
  })

  it("shows approvals correctly", () => {
    render(
      <MilestoneTimeline
        workflow={
          {
            ...mockData,
            panelApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
            panelApprover: {
              name: "foo",
            },
            managerApprovedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
            managerApprover: {
              name: "foo",
            },
            submittedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
            submitter: {
              name: "foo",
            },
          } as unknown as WorkflowForMilestoneTimeline
        }
      />
    )
    expect(screen.getByText("Submitted for approval by foo"))
    expect(screen.getByText("Approved by foo"))
    expect(screen.getByText("Approved on behalf of panel by foo"))
  })

  it("shows a held workflow correctly", () => {
    render(
      <MilestoneTimeline
        workflow={{
          ...mockData,
          heldAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
        }}
      />
    )
    expect(screen.getAllByRole("listitem").length).toBe(4)
    expect(screen.getByText("Edited by Firstname Surname"))
    expect(screen.getByText("Started by Firstname Surname"))
    expect(screen.getByText("Put on hold"))
  })
})
