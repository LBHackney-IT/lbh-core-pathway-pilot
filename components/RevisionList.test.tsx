import { render, screen } from "@testing-library/react"
import { mockRevisionWithActor } from "../fixtures/revisions"
import { mockWorkflow } from "../fixtures/workflows"
import { WorkflowWithCreatorAssigneeAndRevisions } from "../types"
import RevisionList from "./RevisionList"

const mockWorkflowWithRevisions = {
  ...mockWorkflow,
  revisions: [
    {
      ...mockRevisionWithActor,
      id: "test id",
    },
    mockRevisionWithActor,
    mockRevisionWithActor,
  ],
}

describe("WorkflowList", () => {
  it("renders a list of links", () => {
    render(
      <RevisionList
        workflow={
          mockWorkflowWithRevisions as WorkflowWithCreatorAssigneeAndRevisions
        }
      />
    )
    expect(screen.getByText("Latest version", { exact: false }))
    expect(screen.getAllByRole("link").length).toBe(4)
  })

  it("behaves when there are no results to show", () => {
    render(
      <RevisionList
        workflow={
          {
            ...mockWorkflow,
            revisions: [],
          } as WorkflowWithCreatorAssigneeAndRevisions
        }
      />
    )
    expect(screen.getByText("Latest version", { exact: false }))
    expect(screen.getAllByRole("link").length).toBe(1)
    expect(screen.getByText("No older revisions to show"))
  })

  it("renders the selected link differently", () => {
    render(
      <RevisionList
        workflow={
          mockWorkflowWithRevisions as WorkflowWithCreatorAssigneeAndRevisions
        }
      />
    )
    expect(
      screen.getAllByRole("link")[0].getAttribute("aria-selected")
    ).toBeTruthy()

    render(
      <RevisionList
        workflow={
          mockWorkflowWithRevisions as WorkflowWithCreatorAssigneeAndRevisions
        }
        selectedRevisionId="test id"
      />
    )
    expect(
      screen.getAllByRole("link")[1].getAttribute("aria-selected")
    ).toBeTruthy()
  })
})
