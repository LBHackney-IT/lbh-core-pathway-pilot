import Hold from "./Hold"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/router"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

describe("HoldDialog", () => {
  it("can be opened and closed", () => {
    render(<Hold workflowId="foo" />)
    fireEvent.click(screen.getByText("Put on hold"))
    expect(screen.getByRole("dialog"))
    fireEvent.click(screen.getByText("No, cancel"))
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(fetch).toBeCalledTimes(0)
  })

  it("can correctly trigger the hold handler", async () => {
    render(<Hold workflowId="foo" />)
    fireEvent.click(screen.getByText("Put on hold"))
    fireEvent.click(screen.getByText("Yes, hold"))
    await waitFor(() => {
      expect(fetch).toBeCalledWith("/api/workflows/foo", {
        method: "PATCH",
        body: expect.anything(),
      })
    })
  })

  it("can correctly trigger the unhold handler", async () => {
    render(<Hold workflowId="foo" held={true} />)
    fireEvent.click(screen.getByText("Remove hold"))
    fireEvent.click(screen.getByText("Yes, remove hold"))
    await waitFor(() => {
      expect(fetch).toBeCalledWith("/api/workflows/foo", {
        method: "PATCH",
        body: JSON.stringify({
          heldAt: null,
        }),
      })
    })
  })
})
