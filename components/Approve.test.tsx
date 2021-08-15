import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/router"
import Approve from "./Approve"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

describe("DiscardDialog", () => {
  it("can be opened and closed", () => {
    render(<Approve workflowId="foo" />)
    fireEvent.click(screen.getByText("Approve"))
    expect(screen.getByRole("dialog"))
    fireEvent.click(screen.getByText("Close"))
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(fetch).toBeCalledTimes(0)
  })

  it("can approve something", async () => {
    render(<Approve workflowId="foo" />)
    fireEvent.click(screen.getByText("Approve"))
    fireEvent.click(screen.getByText("Yes, approve"))
    fireEvent.click(screen.getByText("Submit"))
    await waitFor(() => {
      expect(fetch).toBeCalledWith("/api/workflows/foo/approval", {
        method: "POST",
        body: JSON.stringify({
          action: "approve",
          reason: "",
        }),
      })
    })
  })

  it("can return something with a reason", async () => {
    render(<Approve workflowId="foo" />)
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
      expect(fetch).toBeCalledWith("/api/workflows/foo/approval", {
        method: "DELETE",
        body: JSON.stringify({
          action: "return",
          reason: "Example reason here",
        }),
      })
    })
  })
})
