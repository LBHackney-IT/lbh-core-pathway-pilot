import { render, screen, fireEvent } from "@testing-library/react"
import EpisodeDialog from "./EpisodeDialog"
import { mockWorkflow } from "../fixtures/workflows"
import { mockForm } from "../fixtures/form"
import { useRouter } from "next/router"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

describe("EpisodeDialog", () => {
  it("can be opened and closed", () => {
    render(
      <EpisodeDialog
        workflow={mockWorkflow}
        linkableWorkflows={[mockWorkflow]}
        forms={[mockForm]}
      />
    )
    fireEvent.click(screen.getByText("Link to something"))
    expect(screen.getByRole("dialog"))
    fireEvent.click(screen.getByText("Close"))
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(fetch).toBeCalledTimes(0)
  })

  it("changes it's wording based on whether the workflow is already linked or not", () => {
    render(
      <EpisodeDialog
        workflow={{
          ...mockWorkflow,
          workflowId: "123abc",
        }}
        linkableWorkflows={[mockWorkflow]}
        forms={[mockForm]}
      />
    )
    expect(screen.getByText("Change"))
    expect(screen.queryByText("Link to something")).toBeNull()
  })
  // it("renders a list of linkable workflows", () => {})
  // it("correctly submits a linked workflow", () => {})
  // it("correctly submits a workflow with no link", () => {})
})
