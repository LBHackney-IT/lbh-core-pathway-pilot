import { render, screen } from "@testing-library/react"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import WorkflowList from "./WorkflowList"

const mockWorkflows = [
  mockWorkflowWithExtras,
  mockWorkflowWithExtras,
  mockWorkflowWithExtras,
]

global.fetch = jest.fn()

describe("WorkflowList", () => {
  it("behaves when there are no results to show", () => {
    render(<WorkflowList workflows={[]} />)
    expect(screen.getByText("No results to show"))
  })
})
