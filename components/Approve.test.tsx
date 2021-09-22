import { render, screen, fireEvent } from "@testing-library/react"
import { useRouter } from "next/router"
import { mockWorkflow } from "../fixtures/workflows"
import Approve from "./Approve"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

describe("ApproveDialog", () => {
  it("can be opened and closed", () => {
    render(<Approve workflow={mockWorkflow} />)
    fireEvent.click(screen.getByText("Approve"))
    expect(screen.getByRole("dialog"))
    fireEvent.click(screen.getByText("Close"))
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("correctly reacts to a submitted workflow", () => {
    render(<Approve workflow={mockWorkflow} />)
    fireEvent.click(screen.getByText("Approve"))
    expect(screen.getByText("Approval"))
    expect(screen.getByText("Yes, approve and send to panel"))
  })

  it("correctly reacts to a manager-approved workflow", () => {
    render(
      <Approve
        workflow={{
          ...mockWorkflow,
          managerApprovedAt: new Date(),
        }}
      />
    )
    fireEvent.click(screen.getByText("Authorise"))
    expect(screen.getByText("Panel authorisation"))
    expect(screen.getByText("Do you want to authorise this work?"))
    expect(screen.getByText("Yes, send to brokerage"))
  })
})
