import { render, screen } from "@testing-library/react"
import MilestoneTimeline from "./MilestoneTimeline"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import { mockRevisionWithActor } from "../fixtures/revisions"

const mockWorkflowWithRevisions = {
  ...mockWorkflowWithExtras,
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
