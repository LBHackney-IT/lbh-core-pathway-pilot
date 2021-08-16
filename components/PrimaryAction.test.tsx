import { render, screen } from "@testing-library/react"
import { useSession } from "next-auth/client"
import { useRouter } from "next/router"
import { mockApprover, mockUser } from "../fixtures/users"
import { mockWorkflow } from "../fixtures/workflows"
import PrimaryAction from "./PrimaryAction"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

jest.mock("next-auth/client")
;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }, false])

describe("PrimaryAction", () => {
  it("shows a resume button for an in-progress workflow", () => {
    render(<PrimaryAction workflow={mockWorkflow} />)
    expect(screen.getByText("Resume"))
  })

  it("shows a restore button for a discarded workflow", () => {
    render(
      <PrimaryAction
        workflow={{
          ...mockWorkflow,
          discardedAt: new Date(),
        }}
      />
    )
    expect(screen.getByText("Restore"))
  })

  it("doesn't show the approve button if the user is not an approver", () => {
    render(
      <PrimaryAction
        workflow={{
          ...mockWorkflow,
          submittedAt: new Date(),
        }}
      />
    )
    expect(screen.queryByText("Approve")).toBeNull()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("shows the approve button if the user is an approver", () => {
    ;(useSession as jest.Mock).mockReturnValue([{ user: mockApprover }, false])
    render(
      <PrimaryAction
        workflow={{
          ...mockWorkflow,
          submittedAt: new Date(),
        }}
      />
    )
    expect(screen.getByText("Approve"))
    expect(screen.getByRole("button"))
  })
})
