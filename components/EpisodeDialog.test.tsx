import {render, screen, fireEvent} from "@testing-library/react"
import EpisodeDialog from "./EpisodeDialog"
import { mockWorkflow } from "../fixtures/workflows"
import { mockForm } from "../fixtures/form"
import { useRouter } from "next/router"
import useWorkflowsByResident from "../hooks/useWorkflowsByResident"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
});

jest.mock("../hooks/useWorkflowsByResident");
(useWorkflowsByResident as jest.Mock).mockReturnValue({
  data: {
    workflows: [mockWorkflow]
  }
})

global.fetch = jest.fn()

describe("EpisodeDialog", () => {
  it("can be opened and closed", () => {
    render(
      <EpisodeDialog
        workflow={mockWorkflow}
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
        forms={[mockForm]}
      />,
    )
    expect(screen.getByText("Change"))
    expect(screen.queryByText("Link to something")).toBeNull()
  })
  
  it("renders a list of linkable workflows", () => {
    render(
      <EpisodeDialog
        workflow={mockWorkflow}
        forms={[mockForm]}
      />
    )
    fireEvent.click(screen.getByText("Link to something"));
    expect(screen.queryByText("None - start a new episode")).toBeVisible();
    fireEvent.click(screen.getByText("None - start a new episode"));
    expect(screen.queryByText("Mock form (last edited 13 Oct 2020)")).toBeVisible();
  });
  // it("correctly submits a linked workflow", () => {})
  // it("correctly submits a workflow with no link", () => {})
})
