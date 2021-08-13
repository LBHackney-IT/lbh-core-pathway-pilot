import { render, screen } from "@testing-library/react"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import WorkflowList from "./WorkflowList"

const mockWorkflows = [
  mockWorkflowWithExtras,
  mockWorkflowWithExtras,
  mockWorkflowWithExtras,
]

describe("WorkflowList", () => {
  it("renders a list of panels", () => {
    render(<WorkflowList workflows={mockWorkflows} />)
    expect(screen.getAllByRole("heading").length).toBe(3)
  })

  it("behaves when there are no results to show", () => {
    render(<WorkflowList workflows={[]} />)
    expect(screen.getByText("No results to show"))
  })

  it("shows the total number of results", () => {
    render(<WorkflowList workflows={mockWorkflows} />)
    expect(screen.getByText("Showing 3 results"))
  })
})
