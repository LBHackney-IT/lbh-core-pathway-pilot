import { render, screen } from "@testing-library/react"
import { mockNextStepOptions } from "../fixtures/nextStepOptions"
import {
  mockWorkflow,
  MockWorkflowWithExtras,
  mockWorkflowWithExtras,
} from "../fixtures/workflows"
import useNextSteps from "../hooks/useNextSteps"
import NextStepsSummary from "./NextStepsSummary"

jest.mock("../hooks/useNextSteps")
const mockNextSteps = {
    options: mockNextStepOptions
  }
;(useNextSteps as jest.Mock).mockReturnValue({ data: mockNextSteps })

describe("NextStepsSummary", () => {
  it("shows nothing if there are no next steps to show", () => {
    render(
      <NextStepsSummary workflow={mockWorkflow as MockWorkflowWithExtras} />
    )
    expect(screen.queryByText("Next steps")).toBeNull()
  })

  it("prints a set of next steps", () => {
    render(<NextStepsSummary workflow={mockWorkflowWithExtras} />)
    // TODO: add assertions
  })

  it("shows when a step is done", () => {
    render(<NextStepsSummary workflow={mockWorkflowWithExtras} />)
    // TODO: add assertions
  })
})
