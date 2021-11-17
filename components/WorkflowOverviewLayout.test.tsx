import { render, screen } from "@testing-library/react"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import WorkflowOverviewLayout from "./WorkflowOverviewLayout"
import useResident from "../hooks/useResident"
import { mockResident } from "../fixtures/residents"
import { useRouter } from "next/router"
import { WorkflowForPrimaryAction } from "./PrimaryAction"
import { useSession } from "next-auth/client"
import { mockApprover, mockUser } from "../fixtures/users"

global.fetch = jest.fn()

jest.mock("next-auth/client")
;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }, false])

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

jest.mock("../hooks/useResident")
;(useResident as jest.Mock).mockReturnValue({ data: mockResident })

describe("WorkflowOverviewLayout", () => {
  it("renders four sets of children", async () => {
    render(
      <WorkflowOverviewLayout
        workflow={mockWorkflowWithExtras}
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
        footer={<>Four</>}
      />
    )

    expect(screen.getByText("One"))
    expect(screen.getByText("Two"))
    expect(screen.getByText("Three"))
    expect(screen.getByText("Four"))
  })

  it("correctly sets the title from the form name", () => {
    render(
      <WorkflowOverviewLayout
        workflow={mockWorkflowWithExtras}
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
      />
    )
    expect(screen.getByRole("heading"))
    expect(screen.getByText("Mock form", { exact: false }))
    expect(screen.getByText("for Firstname Surname", { exact: false }))
  })

  it("marks an urgent workflow", () => {
    render(
      <WorkflowOverviewLayout
        workflow={
          {
            ...mockWorkflowWithExtras,
            heldAt: "2021-08-04T10:11:40.593Z",
          } as unknown as WorkflowForPrimaryAction
        }
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
      />
    )
    expect(screen.getByText("Urgent"))
  })

  it("marks a review workflow", () => {
    render(
      <WorkflowOverviewLayout
        workflow={{
          ...mockWorkflowWithExtras,
          type: "Review",
        }}
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
      />
    )
    expect(screen.getByText("Reassessment"))
  })

  it("marks a reassessment workflow", () => {
    render(
      <WorkflowOverviewLayout
        workflow={{
          ...mockWorkflowWithExtras,
          type: "Reassessment",
        }}
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
      />
    )
    expect(screen.getByText("Reassessment"))
  })

  it("marks a historic workflow", () => {
    render(
      <WorkflowOverviewLayout
        workflow={{
          ...mockWorkflowWithExtras,
          type: "Historic",
        }}
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
      />
    )
    expect(screen.getByText("Historic"))
  })

  it("doesn't show discard to non-approvers", () => {
    render(
      <WorkflowOverviewLayout
        workflow={mockWorkflowWithExtras}
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
      />
    )
    expect(screen.queryByText("Close")).toBeNull()
  })

  it("shows discard to approvers", () => {
    ;(useSession as jest.Mock).mockReturnValue([
      {
        user: mockApprover,
      },
      false,
    ])
    render(
      <WorkflowOverviewLayout
        workflow={mockWorkflowWithExtras}
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
      />
    )
    expect(screen.queryByText("Close"))
  })

  it("doesn't show an option to discard an already-discarded workflow", () => {
    ;(useSession as jest.Mock).mockReturnValue([
      {
        user: mockApprover,
      },
      false,
    ])
    render(
      <WorkflowOverviewLayout
        workflow={
          {
            ...mockWorkflowWithExtras,
            discardedAt: "2021-08-04T10:11:40.593Z",
          } as unknown as WorkflowForPrimaryAction
        }
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
      />
    )
    expect(screen.queryByText("Close")).toBeNull()
  })

  it("doesn't show secondary actions unless a workflow is in progress", () => {
    ;(useSession as jest.Mock).mockReturnValue([
      {
        user: mockApprover,
      },
      false,
    ])
    render(
      <WorkflowOverviewLayout
        workflow={{
          ...mockWorkflowWithExtras,
          submittedAt: "2021-08-04T10:11:40.593Z" as unknown as Date,
        }}
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
      />
    )
    expect(screen.queryByText("Close")).toBeNull()
    expect(screen.queryByText("Hold")).toBeNull()
  })
})
