import { render, screen } from "@testing-library/react"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import WorkflowOverviewLayout from "./WorkflowOverviewLayout"
import useResident from "../hooks/useResident"
import { mockResident } from "../fixtures/residents"
import { useRouter } from "next/router"
import { WorkflowWithExtras } from "../types"

global.fetch = jest.fn()

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

jest.mock("../hooks/useResident")
;(useResident as jest.Mock).mockReturnValue({ data: mockResident })

describe("WorkflowOverviewLayout", () => {
  it("renders three sets of children", () => {
    render(
      <WorkflowOverviewLayout
        workflow={mockWorkflowWithExtras}
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
      />
    )

    expect(screen.getByText("One"))
    expect(screen.getByText("Two"))
    expect(screen.getByText("Three"))
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
    expect(screen.getByText("Mock form for Firstname Surname"))
  })

  it("marks a held workflow", () => {
    render(
      <WorkflowOverviewLayout
        workflow={
          {
            ...mockWorkflowWithExtras,
            heldAt: "2021-08-04T10:11:40.593Z",
          } as unknown as WorkflowWithExtras
        }
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
      />
    )
    expect(screen.getByText("On hold"))
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
    expect(screen.getByText("Review"))
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
})
