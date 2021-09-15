import Discard from "./Discard"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/router"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

describe("DiscardDialog", () => {
  it("can be opened and closed", () => {
    render(<Discard workflowId="foo" />)
    fireEvent.click(screen.getByText("Close"))
    expect(screen.getByRole("dialog"))
    fireEvent.click(screen.getByText("No, cancel"))
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(fetch).toBeCalledTimes(0)
  })

  it("can correctly trigger the discard handler", async () => {
    render(<Discard workflowId="foo" />)
    fireEvent.click(screen.getByText("Close"))
    fireEvent.click(screen.getByText("Yes, close"))
    await waitFor(() => {
      expect(fetch).toBeCalledWith("/api/workflows/foo", { method: "DELETE" })
    })
  })
})
