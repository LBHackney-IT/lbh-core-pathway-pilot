import { WorkflowType } from ".prisma/client"
import { render, screen } from "@testing-library/react"
import { mockWorkflow } from "../fixtures/workflows"
import { Step } from "../types"
import StepList from "./StepList"

const mockSteps = [
  {
    id: "12345",
    name: "foo",
  },
  {
    id: "123456",
    name: "bar",
  },
]

describe("StepList", () => {
  it("renders a clickable list of steps", () => {
    render(
      <StepList
        steps={mockSteps as Step[]}
        workflow={mockWorkflow}
        completedSteps={[]}
      />
    )
    expect(screen.getAllByRole("listitem").length).toBe(2)
    expect(screen.getAllByRole("link").length).toBe(2)
    expect(screen.getAllByText("To do").length).toBe(2)
  })

  it("marks steps as done", () => {
    render(
      <StepList
        steps={mockSteps as Step[]}
        workflow={mockWorkflow}
        completedSteps={["12345"]}
      />
    )
    expect(screen.getByText("To do"))
    expect(screen.getByText("Done"))
  })

  it("renders the correct links for reviews", () => {
    render(
      <StepList
        steps={mockSteps as Step[]}
        workflow={{
          ...mockWorkflow,
          type: WorkflowType.Reassessment,
        }}
        completedSteps={[]}
      />
    )
    expect(
      (screen.getAllByRole("link")[0] as HTMLAnchorElement).href
    ).toContain("/reviews")
  })
})
