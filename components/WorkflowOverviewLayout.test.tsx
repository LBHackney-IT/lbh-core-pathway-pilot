import { render, screen } from "@testing-library/react"
import { mockWorkflowWithCreatorAndAssignee } from "../fixtures/workflows"
import { WorkflowWithCreatorAssigneeAndRevisions } from "../types"
import WorkflowOverviewLayout from "./WorkflowOverviewLayout"
import useResident from "../hooks/useResident"
import { mockResident } from "../fixtures/residents"
import { useRouter } from "next/router"

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
        workflow={
          mockWorkflowWithCreatorAndAssignee as WorkflowWithCreatorAssigneeAndRevisions
        }
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
      />
    )
    expect(screen.getByText("One"))
    expect(screen.getByText("Two"))
    expect(screen.getByText("Three"))
  })

  it("correctly sets the title from the resident's name", () => {
    render(
      <WorkflowOverviewLayout
        workflow={
          mockWorkflowWithCreatorAndAssignee as WorkflowWithCreatorAssigneeAndRevisions
        }
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
      />
    )
    expect(screen.getByRole("heading"))
    expect(screen.getByText("Firstname Surname"))
  })

  it("marks a held workflow", () => {
    render(
      <WorkflowOverviewLayout
        workflow={
          {
            ...mockWorkflowWithCreatorAndAssignee,
            heldAt: "2021-08-04T10:11:40.593Z",
          } as unknown as WorkflowWithCreatorAssigneeAndRevisions
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
        workflow={
          {
            ...mockWorkflowWithCreatorAndAssignee,
            workflowId: "123456",
          } as unknown as WorkflowWithCreatorAssigneeAndRevisions
        }
        nav={<>One</>}
        sidebar={<>Two</>}
        mainContent={<>Three</>}
      />
    )
    expect(screen.getByText("Review"))
  })
})
