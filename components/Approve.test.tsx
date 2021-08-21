import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/router"
import { mockWorkflow } from "../fixtures/workflows"
import Approve from "./Approve"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

describe("ApproveDialog", () => {
  it("can be opened and closed", () => {
    render(<Approve workflow={mockWorkflow} />)
    fireEvent.click(screen.getByText("Approve"))
    expect(screen.getByRole("dialog"))
    fireEvent.click(screen.getByText("Close"))
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(fetch).toBeCalledTimes(0)
  })

  it("correctly reacts to a submitted workflow", () => {
    render(<Approve workflow={mockWorkflow} />)
    fireEvent.click(screen.getByText("Approve"))
    expect(screen.getByText("Approval"))
    expect(screen.getByText("Yes, approve"))
  })

  it("correctly reacts to a manager-approved workflow", () => {
    render(
      <Approve
        workflow={{
          ...mockWorkflow,
          managerApprovedAt: new Date(),
        }}
      />
    )
    fireEvent.click(screen.getByText("Approve for panel"))
    expect(screen.getByText("Panel approval"))
    expect(screen.getByText("Has the panel approved this work?"))
    expect(screen.getByText("Yes, the panel has approved this"))
  })

  it("can approve something", async () => {
    render(<Approve workflow={mockWorkflow} />)
    fireEvent.click(screen.getByText("Approve"))
    fireEvent.click(screen.getByText("Yes, approve"))
    fireEvent.click(screen.getByText("Submit"))
    await waitFor(() => {
      expect(fetch).toBeCalledWith("/api/workflows/123abc/approval", {
        method: "POST",
        body: JSON.stringify({
          action: "approve",
          reason: "",
        }),
      })
    })
  })

  it("can return something with a reason", async () => {
    render(<Approve workflow={mockWorkflow} />)
    fireEvent.click(screen.getByText("Approve"))
    fireEvent.click(screen.getByLabelText("No, return for edits"))
    fireEvent.change(
      screen.getByLabelText("What needs to be changed?", { exact: false }),
      {
        target: { value: "Example reason here" },
      }
    )
    fireEvent.click(screen.getByText("Submit"))
    await waitFor(() => {
      expect(fetch).toBeCalledWith("/api/workflows/123abc/approval", {
        method: "DELETE",
        body: JSON.stringify({
          action: "return",
          reason: "Example reason here",
        }),
      })
    })
  })
})
