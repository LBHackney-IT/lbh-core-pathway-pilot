import { render } from "@testing-library/react"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import NextStepsSummary from "./NextStepsSummary"

describe("NextStepsSummary", () => {
  it("prints a set of next steps", () => {
    render(<NextStepsSummary workflow={mockWorkflowWithExtras} />)
  })

  it("shows when a step is done", () => {
    render(<NextStepsSummary workflow={mockWorkflowWithExtras} />)
  })
})
