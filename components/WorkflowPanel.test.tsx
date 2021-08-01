import { render } from "@testing-library/react"
import { mockWorkflowWithCreator } from "../fixtures/workflows"
import WorkflowPanel from "./WorkflowPanel"

describe("WorkflowPanel", () => {
  it("shows basic information about the workflow", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithCreator} />)
  })

  it("indicates progress", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithCreator} />)
  })

  it("displays reviews differently", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithCreator} />)
  })
})
