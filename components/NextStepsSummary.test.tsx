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
  options: mockNextStepOptions,
}
;(useNextSteps as jest.Mock).mockReturnValue({ data: mockNextSteps })

describe("NextStepsSummary", () => {
  it("shows nothing if there are no next steps to show", () => {
    render(
      <NextStepsSummary workflow={mockWorkflow as MockWorkflowWithExtras} />
    )
    expect(screen.queryByText("Next steps")).toBeNull()
  })

  it("prints out the rows for next steps if there are next steps", () => {
    render(<NextStepsSummary workflow={mockWorkflowWithExtras} />)

    const expectedNumberOfRows = mockWorkflowWithExtras.nextSteps.length

    expect(screen.queryByText("Next steps")).not.toBeNull()
    expect(screen.getAllByRole("row").length).toBe(expectedNumberOfRows)
  })

  it("shows when a next step is done", () => {
    render(<NextStepsSummary workflow={mockWorkflowWithExtras} />)
    const expectedNumberWithTriggeredDate =
      mockWorkflowWithExtras.nextSteps.length

    expect(screen.getAllByText("Done").length).toBe(
      expectedNumberWithTriggeredDate
    )
  })
})
