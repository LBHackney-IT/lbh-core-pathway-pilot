import Restore from "./Restore"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/router"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

describe("Restore", () => {
  it("can be opened and closed", () => {
    render(<Restore workflowId="foo" />)
    fireEvent.click(screen.getByText("Restore"))
    expect(screen.getByRole("dialog"))
    fireEvent.click(screen.getByText("No, cancel"))
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(fetch).toBeCalledTimes(0)
  })

  it("can correctly trigger the restoration handler", async () => {
    render(<Restore workflowId="foo" />)
    fireEvent.click(screen.getByText("Restore"))
    fireEvent.click(screen.getByText("Yes, restore"))
    await waitFor(() => {
      expect(fetch).toBeCalledWith("/api/workflows/foo", {
        method: "PATCH",
        body: JSON.stringify({ discardedAt: null }),
      })
    })
  })
})
