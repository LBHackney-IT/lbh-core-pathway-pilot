import { render, screen } from "@testing-library/react"
import { mockRevisionWithActor } from "../fixtures/revisions"
import { mockWorkflowWithCreatorAssigneeAndUpdater } from "../fixtures/workflows"
import { WorkflowWithCreatorAssigneeUpdaterAndRevisions } from "../types"
import RevisionList from "./RevisionList"

const mockWorkflowWithRevisions = {
  ...mockWorkflowWithCreatorAssigneeAndUpdater,
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
  it("renders a list of links, marking the oldest and newest", () => {
    render(
      <RevisionList
        workflow={
          mockWorkflowWithRevisions as WorkflowWithCreatorAssigneeUpdaterAndRevisions
        }
      />
    )
    expect(screen.getByText("Latest version", { exact: false }))
    expect(screen.getAllByRole("link").length).toBe(4)
    expect(screen.getByText("Oldest version", { exact: false }))
  })

  it("behaves when there are no results to show", () => {
    render(
      <RevisionList
        workflow={
          {
            ...mockWorkflowWithCreatorAssigneeAndUpdater,
            revisions: [],
          } as WorkflowWithCreatorAssigneeUpdaterAndRevisions
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
          mockWorkflowWithRevisions as WorkflowWithCreatorAssigneeUpdaterAndRevisions
        }
      />
    )
    expect(
      screen.getAllByRole("link")[0].getAttribute("aria-selected")
    ).toBeTruthy()

    render(
      <RevisionList
        workflow={
          mockWorkflowWithRevisions as WorkflowWithCreatorAssigneeUpdaterAndRevisions
        }
        selectedRevisionId="test id"
      />
    )
    expect(
      screen.getAllByRole("link")[1].getAttribute("aria-selected")
    ).toBeTruthy()
  })
})
