import Hold from "./Hold"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/router"
import {renderWithSession} from "../lib/auth/test-functions";
import {mockSession} from "../fixtures/session";

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

document.head.insertAdjacentHTML(
  "afterbegin",
  '<meta http-equiv="XSRF-TOKEN" content="test" />'
)

describe("components/HoldDialog", () => {
  describe("when user is in pilot group", () => {

    it("can be opened and closed", () => {
      renderWithSession(<Hold workflowId="foo" />);
      fireEvent.click(screen.getByText("Mark urgent"))
      expect(screen.getByRole("dialog"))
      fireEvent.click(screen.getByText("No, cancel"))
      expect(screen.queryByRole("dialog")).toBeNull()
      expect(fetch).toBeCalledTimes(0)
    })

    it("can correctly trigger the urgent handler", async () => {
      renderWithSession(<Hold workflowId="foo" />)
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
      renderWithSession(<Hold workflowId="foo" held={true} />)
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
    it("doesn't show mark as urgent button", () => {
      renderWithSession(<Hold workflowId="foo" />, {...mockSession, inPilot: false})

      expect(screen.queryByText("Mark urgent")).toBeNull()
      expect(screen.queryByRole("button")).toBeNull()
    })

    it("doesn't show remove urgent button", () => {
      renderWithSession(<Hold workflowId="foo" held={true} />, {...mockSession, inPilot: false})

      expect(screen.queryByText("Remove urgent")).toBeNull()
      expect(screen.queryByRole("button")).toBeNull()
    })
  })
})
