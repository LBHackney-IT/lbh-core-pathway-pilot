import { render, screen } from "@testing-library/react"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import WorkflowPanel from "./WorkflowPanel"
import swr from "swr"
import { mockResident } from "../fixtures/residents"
import { WorkflowWithExtras } from "../types"

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
    expect(screen.getByText("Firstname Surname"))
    expect(
      screen.getByText("Started by Firstname Surname · Unassigned", {
        exact: false,
      })
    )
  })

  it("shows an assigned workflow correctly", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithExtras} />)
    expect(screen.getByText("Firstname Surname"))
    expect(screen.getByText("Assigned to Firstname Surname", { exact: false }))
  })

  it("shows a held workflow correctly", () => {
    render(
      <WorkflowPanel
        workflow={
          {
            ...mockWorkflowWithExtras,
            heldAt: "2021-08-04T10:11:40.593Z",
          } as unknown as WorkflowWithExtras
        }
      />
    )
    expect(screen.getByText("Held since 4 Aug 2021", { exact: false }))
  })

  it("indicates progress", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithExtras} />)
    expect(screen.getByText("0%"))
    expect(screen.getByText("In progress"))
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
    expect(screen.getByText("Review"))
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
    expect(screen.getByText("Reassessment"))
  })
})
