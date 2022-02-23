import { WorkflowType } from "@prisma/client"
import { render, screen } from "@testing-library/react"
import { mockForm } from "../fixtures/form"
import { mockWorkflow, mockWorkflowWithExtras } from "../fixtures/workflows"
import LinkedWorkflowList from "./LinkedWorkflowList"
import { useRouter } from "next/router"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

describe("LinkedWorkflowList", () => {
  it("marks the reassessment differently", () => {
    render(
      <LinkedWorkflowList
        workflow={mockWorkflowWithExtras}
        forms={[mockForm]}
      />
    )
    expect(screen.queryByText("(reassessment)")).toBeNull()

    render(
      <LinkedWorkflowList
        workflow={{
          ...mockWorkflowWithExtras,
          nextWorkflows: [
            {
              ...mockWorkflow,
              type: WorkflowType.Reassessment,
            },
          ],
        }}
        forms={[mockForm]}
      />
    )
    expect(screen.getByText("(reassessment)"))
  })
  it("shows links to parent and child workflows", () => {
    render(
      <LinkedWorkflowList
        workflow={{
          ...mockWorkflowWithExtras,
          nextWorkflows: [{
            ...mockWorkflowWithExtras,
            id: 'child-workflow',
          }],
          previousWorkflow: {
            ...mockWorkflowWithExtras,
            id: 'parent-workflow',
          },
        }}
        forms={[mockForm]}
      />
    )

    expect(screen.queryAllByText('Mock form')[0]).toHaveAttribute('href', '/workflows/child-workflow');
    expect(screen.queryAllByText('Mock form')[1]).toHaveAttribute('href', '/workflows/parent-workflow');
  })
  it("hides parent and child workflows if not set", () => {
    render(
      <LinkedWorkflowList
        workflow={{
          ...mockWorkflowWithExtras,
          nextWorkflows: [],
          previousWorkflow: null,
        }}
        forms={[mockForm]}
      />
    )

    expect(screen.queryAllByRole("list")).toHaveLength(0)
  })
  it("only shows parent workflow if set", () => {
    render(
      <LinkedWorkflowList
        workflow={{
          ...mockWorkflowWithExtras,
          nextWorkflows: [],
          previousWorkflow: {...mockWorkflowWithExtras, id: '1295864'},
        }}
        forms={[mockForm]}
      />
    )

    expect(screen.getByText("Parent workflow")).toBeVisible();
    expect(screen.queryByText("Later workflows")).toBeNull();
  })
  it("only shows child workflows if set", () => {
    render(
      <LinkedWorkflowList
        workflow={{
          ...mockWorkflowWithExtras,
          nextWorkflows: [mockWorkflowWithExtras],
          previousWorkflow: null
        }}
        forms={[mockForm]}
      />
    )

    expect(screen.queryByText("Parent workflow")).toBeNull();
    expect(screen.getByText("Later workflows")).toBeVisible();
  })
})
