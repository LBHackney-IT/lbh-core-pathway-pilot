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
  it("renders nothing if there are no child workflows", () => {
    render(
      <LinkedWorkflowList
        workflow={{
          ...mockWorkflowWithExtras,
          nextWorkflows: [],
        }}
        forms={[mockForm]}
      />
    )
    expect(screen.queryByRole("list")).toBeNull()
  })

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

  it("shows child workflows correctly", () => {
    render(
      <LinkedWorkflowList
        workflow={mockWorkflowWithExtras}
        forms={[mockForm]}
      />
    )
    expect(screen.getAllByRole("list").length).toBe(3)
    expect(screen.getAllByRole("listitem").length).toBe(4)
    expect(screen.getByText("Later workflows"))
    expect(screen.getByText("Parent workflow"))
  })

  it("hides parent workflow if not set", () => {
    render(
      <LinkedWorkflowList
        workflow={{
          ...mockWorkflowWithExtras,
          previousWorkflow: null,
        }}
        forms={[mockForm]}
      />
    )
    expect(screen.getAllByRole("list").length).toBe(2)
    expect(screen.queryByText("Parent workflow")).toBeNull()
  })
})
