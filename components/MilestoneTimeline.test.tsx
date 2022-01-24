import { render, screen } from "@testing-library/react"
import MilestoneTimeline, {
  WorkflowForMilestoneTimeline,
} from "./MilestoneTimeline"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import { mockRevisionWithActor } from "../fixtures/revisions"
import { Workflow, WorkflowType } from "@prisma/client"
import { mockForms } from "../fixtures/form"

const mockWorkflowWithRevisions = {
  ...mockWorkflowWithExtras,
  workflowId: null,
  revisions: [],
  nextWorkflows: [],
  previousWorkflow: null,
}

describe("MilestoneTimeline", () => {
  it("shows a brand new workflow correctly", () => {
    render(
      <MilestoneTimeline
        workflow={mockWorkflowWithRevisions}
        forms={mockForms}
      />
    )
    expect(screen.getAllByRole("listitem").length).toBe(1)
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
    nextWorkflows: [],
    previousWorkflow: null,
  }

  it("shows an edited workflow correctly", () => {
    render(<MilestoneTimeline workflow={mockData} forms={mockForms} />)
    expect(screen.getAllByRole("listitem").length).toBe(2)
    expect(screen.getByText("Edited by Firstname Surname"))
    expect(screen.getByText("Started by Firstname Surname"))
  })

  it("shows a review correctly", () => {
    render(
      <MilestoneTimeline
        workflow={{
          ...mockWorkflowWithExtras,
          workflowId: "123abc",
          nextWorkflows: [],
          previousWorkflow: {
            id: "abc123",
          } as Workflow,
        }}
        forms={mockForms}
      />
    )
    expect(screen.getAllByRole("listitem").length).toBe(2)
    expect(screen.getByText("Edited by Firstname Surname"))
  })

  it("shows authorised workflows correctly", () => {
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
        forms={mockForms}
      />
    )
    expect(screen.getByText("Submitted for approval by foo"))
    expect(screen.getByText("Approved by foo"))
    expect(screen.getByText("Authorised by foo"))
  })

  it("shows the review before date if relevant", () => {
    render(
      <MilestoneTimeline
        workflow={{
          ...mockData,
          // type: WorkflowType.Reassessment,
          reviewBefore: "2021-08-04T10:11:40.593Z" as unknown as Date,
          nextWorkflows: [
            {
              ...mockWorkflowWithExtras,
              WorkflowType: WorkflowType.Reassessment,
            },
          ],
        }}
        forms={mockForms}
      />
    )

    screen.debug()
    expect(screen.getAllByRole("listitem").length).toBe(3)
    expect(screen.getByText("Reassess before", { exact: false }))
  })

  it("shows an acknowledged workflow correctly", () => {
    render(
      <MilestoneTimeline
        workflow={
          {
            ...mockData,
            acknowledgedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
            acknowledger: {
              name: "foo",
            },
            acknowledgingTeam: "DirectPayments",
            previousWorkflow: null,
          } as unknown as WorkflowForMilestoneTimeline
        }
        forms={mockForms}
      />
    )
    expect(screen.getAllByRole("listitem").length).toBe(3)
    expect(
      screen.getByText("Acknowledged by foo for direct payments team", {
        exact: false,
      })
    )
  })
})
