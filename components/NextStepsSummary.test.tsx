import { render, screen } from "@testing-library/react"
import {
  mockWorkflow,
  MockWorkflowWithExtras,
  mockWorkflowWithExtras,
} from "../fixtures/workflows"
import NextStepsSummary from "./NextStepsSummary"

describe("NextStepsSummary", () => {
  it("shows nothing if there are no next steps to show", () => {
    render(
      <NextStepsSummary workflow={mockWorkflow as MockWorkflowWithExtras} />
    )
    expect(screen.queryByText("Next steps")).toBeNull()
  })

  it("prints a set of next steps", () => {
    render(<NextStepsSummary workflow={mockWorkflowWithExtras} />)
  })

  it("shows when a step is done", () => {
    render(<NextStepsSummary workflow={mockWorkflowWithExtras} />)
  })
})
