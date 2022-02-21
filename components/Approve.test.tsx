import { render, screen, fireEvent } from "@testing-library/react"
import { useRouter } from "next/router"
import { mockNextStepOptions } from "../fixtures/nextStepOptions"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import useNextSteps from "../hooks/useNextSteps"
import Approve from "./Approve"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

jest.mock("../hooks/useNextSteps")
;(useNextSteps as jest.Mock).mockReturnValue({ data: mockNextStepOptions })

global.fetch = jest.fn()

describe("ApproveDialog", () => {
  it("can be opened and closed", () => {
    render(<Approve workflow={mockWorkflowWithExtras} />)
    fireEvent.click(screen.getByText("Make a decision"))
    expect(screen.getByRole("dialog"))
    fireEvent.click(screen.getByText("Close"))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("correctly reacts to a submitted workflow", () => {
    render(<Approve workflow={mockWorkflowWithExtras} />)
    fireEvent.click(screen.getByText("Make a decision"))
    expect(screen.getByText("Approval"))
    expect(screen.getByText("Yes, approve and send to QAM"))
  })

  it("correctly reacts to a manager-approved workflow", () => {
    render(
      <Approve
        workflow={{
          ...mockWorkflowWithExtras,
          managerApprovedAt: new Date(),
        }}
      />
    )
    fireEvent.click(screen.getByText("Make a decision"))
    expect(screen.getByText("Quality assurance meeting"))
    expect(
      screen.getByText(
        "Has this been authorised in a quality assurance meeting?"
      )
    )
    expect(screen.getByText("Yes, it has been authorised"))
  })
})
