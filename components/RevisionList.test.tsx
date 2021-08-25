import { render, screen } from "@testing-library/react"
import { mockRevisionWithActor } from "../fixtures/revisions"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import RevisionList from "./RevisionList"

const mockWorkflowWithRevisions = {
  ...mockWorkflowWithExtras,
  revisions: [
    {
      ...mockRevisionWithActor,
      id: "test id",
    },
    {
      ...mockRevisionWithActor,
      id: "test id 2",
    },
    mockRevisionWithActor,
  ],
}

describe("WorkflowList", () => {
  it("renders a list of links, marking the oldest and newest", () => {
    render(<RevisionList workflow={mockWorkflowWithRevisions} />)
    expect(screen.getByText("Current version", { exact: false }))
    expect(screen.getAllByRole("link").length).toBe(4)
    expect(screen.getByText("0% complete · Oldest version", { exact: false }))
  })

  it("behaves when there are no results to show", () => {
    render(
      <RevisionList
        workflow={{
          ...mockWorkflowWithExtras,
          revisions: [],
        }}
      />
    )
    expect(screen.getByText("Current version", { exact: false }))
    expect(screen.getAllByRole("link").length).toBe(1)
    expect(screen.getByText("No older revisions to show"))
  })

  it("renders the selected link differently", () => {
    render(<RevisionList workflow={mockWorkflowWithRevisions} />)
    expect(
      screen.getAllByRole("link")[0].getAttribute("aria-selected")
    ).toBeTruthy()

    render(
      <RevisionList
        workflow={mockWorkflowWithRevisions}
        selectedRevisionId="test id"
      />
    )
    expect(
      screen.getAllByRole("link")[1].getAttribute("aria-selected")
    ).toBeTruthy()
  })
})
