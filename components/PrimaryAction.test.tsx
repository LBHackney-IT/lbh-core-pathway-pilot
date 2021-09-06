import { render, screen } from "@testing-library/react"
import { useSession } from "next-auth/client"
import { useRouter } from "next/router"
import { mockApprover, mockPanelApprover, mockUser } from "../fixtures/users"
import { mockWorkflow, MockWorkflowWithExtras } from "../fixtures/workflows"
import PrimaryAction from "./PrimaryAction"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

jest.mock("next-auth/client")
;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }, false])

describe("PrimaryAction", () => {
  it("shows a resume button for an in-progress workflow", () => {
    render(<PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />)
    expect(screen.getByText("Resume"))
  })

  it("shows a review button for a finished workflow", () => {
    render(
      <PrimaryAction
        workflow={
          {
            ...mockWorkflow,
            panelApprovedAt: new Date(),
          } as MockWorkflowWithExtras
        }
      />
    )
    expect(screen.getByText("Start reassessment"))
  })

  it("doesn't show the approve button if the user is not an approver", () => {
    render(
      <PrimaryAction
        workflow={
          {
            ...mockWorkflow,
            submittedAt: new Date(),
          } as MockWorkflowWithExtras
        }
      />
    )
    expect(screen.queryByText("Approve")).toBeNull()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("shows the approve button if the user is an approver", () => {
    ;(useSession as jest.Mock).mockReturnValue([{ user: mockApprover }, false])
    render(
      <PrimaryAction
        workflow={
          {
            ...mockWorkflow,
            submittedAt: new Date(),
          } as MockWorkflowWithExtras
        }
      />
    )
    expect(screen.getByText("Approve"))
    expect(screen.getByRole("button"))
  })

  it("doesn't show the panel approve button if the user is not an approver", () => {
    render(
      <PrimaryAction
        workflow={
          {
            ...mockWorkflow,
            managerApprovedAt: new Date(),
          } as MockWorkflowWithExtras
        }
      />
    )
    expect(screen.queryByText("Approve for panel")).toBeNull()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("shows the panel approve button if the user is an approver", () => {
    ;(useSession as jest.Mock).mockReturnValue([
      { user: mockPanelApprover },
      false,
    ])
    render(
      <PrimaryAction
        workflow={
          {
            ...mockWorkflow,
            managerApprovedAt: new Date(),
          } as MockWorkflowWithExtras
        }
      />
    )
    expect(screen.getByText("Approve for panel"))
    expect(screen.getByRole("button"))
  })

  it("shows a restore button for a discarded workflow", () => {
    ;(useSession as jest.Mock).mockReturnValue([{ user: mockApprover }, false])
    render(
      <PrimaryAction
        workflow={
          {
            ...mockWorkflow,
            discardedAt: new Date(),
          } as MockWorkflowWithExtras
        }
      />
    )
    expect(screen.getByText("Restore"))
  })
})
