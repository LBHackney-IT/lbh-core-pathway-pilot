import { render } from "@testing-library/react"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import TaskList from "./TaskList"

describe("Task List Component Tests", () => {
  it("should render the Task List component properly", () => {
    const { getAllByText } = render(<TaskList workflow={mockWorkflowWithExtras} />);
    expect(getAllByText('1. Mock theme')).not.toBe(null);
  })
})
