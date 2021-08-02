import { render, screen } from "@testing-library/react"
import { mockWorkflowWithCreator } from "../fixtures/workflows"
import WorkflowPanel from "./WorkflowPanel"
import swr from "swr"
import { mockResident } from "../fixtures/residents"

jest.mock("swr")
;(swr as jest.Mock).mockReturnValue({
  data: mockResident,
})

describe("WorkflowPanel", () => {
  it("calls the hook correctly", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithCreator} />)
    expect(swr).toBeCalledWith("/api/residents/123")
  })

  it("shows basic information about the workflow", () => {
    render(<WorkflowPanel workflow={mockWorkflowWithCreator} />)
    expect(screen.getByText("Firstname Surname"))
    expect(screen.getByText("Started by Firstname Surname", { exact: false }))
  })

  // it("indicates progress", () => {
  //   render(<WorkflowPanel workflow={mockWorkflowWithCreator} />)
  // })

  // it("displays reviews differently", () => {
  //   render(<WorkflowPanel workflow={mockWorkflowWithCreator} />)
  // })
})
