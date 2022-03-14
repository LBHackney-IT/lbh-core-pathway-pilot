import { render } from "@testing-library/react"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import { mockForm } from "../fixtures/form"
import TaskList from "./TaskList"

describe("Task List Component Tests", () => {
  it("should render the Task List component properly", () => {
    const taskList = render(<TaskList workflow={mockWorkflowWithExtras} />);
    // expect(taskList).not.toBe(null);
  })
})
