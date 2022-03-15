import { act, render, screen } from "@testing-library/react"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import TaskList from "./TaskList"

describe("Task List Component Tests", () => {
  beforeEach(async () => {
    await act(async () => {
      await render(<TaskList workflow={mockWorkflowWithExtras} />)
    })
  })
  it("should render the Task List component properly", () => {
    expect(screen.getAllByText("1. Mock theme")).not.toBe(null)
  })
  it("should show a theme if the typeFilter matches the workflow type", () => {
    expect(screen.getAllByText("1. Mock theme")).not.toBe(null)
  })
  it("should not show a theme if there is no typeFilter", () => {
    expect(screen.queryByText("3. Mock theme 3")).toBe(null)
  })
  it("should show a theme if there are multiple typeFilter and one of them matches the workflow type", () => {
    expect(screen.queryByText("2. Mock theme 2")).not.toBe(null)
  })
})
