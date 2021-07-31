import { render } from "@testing-library/react"
import { mockWorkflow } from "../fixtures/workflows"
import WorkflowPanel from "./WorkflowPanel"

describe("WorkflowPanel", () => {
  it("shows basic information about the workflow", () => {
    render(<WorkflowPanel workflow={mockWorkflow} />)
  })
  it("indicates progress", () => {
    render(<WorkflowPanel workflow={mockWorkflow} />)
  })
  it("displays reviews differently", () => {
    render(<WorkflowPanel workflow={mockWorkflow} />)
  })
})
