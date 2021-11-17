import Hold from "./Hold"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/client"
import { mockUser } from "../fixtures/users"

jest.mock("next-auth/client")

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

document.head.insertAdjacentHTML(
  "afterbegin",
  '<meta http-equiv="XSRF-TOKEN" content="test" />'
)

describe("HoldDialog", () => {
  describe("when user is in pilot group", () => {
    beforeAll(() => {
      ;(useSession as jest.Mock).mockReturnValue([
        { user: { ...mockUser, inPilot: true } },
        false,
      ])
    })

    it("can be opened and closed", () => {
      render(<Hold workflowId="foo" />)
      fireEvent.click(screen.getByText("Mark urgent"))
      expect(screen.getByRole("dialog"))
      fireEvent.click(screen.getByText("No, cancel"))
      expect(screen.queryByRole("dialog")).toBeNull()
      expect(fetch).toBeCalledTimes(0)
    })

    it("can correctly trigger the urgent handler", async () => {
      render(<Hold workflowId="foo" />)
      fireEvent.click(screen.getByText("Mark urgent"))
      fireEvent.click(screen.getByText("Yes, mark as urgent"))
      await waitFor(() => {
        expect(fetch).toBeCalledWith("/api/workflows/foo", {
          method: "PATCH",
          body: expect.anything(),
          headers: { "XSRF-TOKEN": "test" },
        })
      })
    })

    it("can correctly trigger the un-urgent handler", async () => {
      render(<Hold workflowId="foo" held={true} />)
      fireEvent.click(screen.getByText("Remove urgent"))
      fireEvent.click(screen.getByText("Yes, remove"))
      await waitFor(() => {
        expect(fetch).toBeCalledWith("/api/workflows/foo", {
          method: "PATCH",
          body: JSON.stringify({
            heldAt: null,
          }),
          headers: { "XSRF-TOKEN": "test" },
        })
      })
    })
  })

  describe("when user is not in pilot group", () => {
    beforeAll(() => {
      ;(useSession as jest.Mock).mockReturnValue([
        { user: { ...mockUser, inPilot: false } },
        false,
      ])
    })

    it("doesn't show mark as urgent button", () => {
      render(<Hold workflowId="foo" />)

      expect(screen.queryByText("Mark urgent")).toBeNull()
      expect(screen.queryByRole("button")).toBeNull()
    })

    it("doesn't show remove urgent button", () => {
      render(<Hold workflowId="foo" held={true} />)

      expect(screen.queryByText("Remove urgent")).toBeNull()
      expect(screen.queryByRole("button")).toBeNull()
    })
  })
})
