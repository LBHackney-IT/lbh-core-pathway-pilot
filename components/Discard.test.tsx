import Discard from "./Discard"
import { screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/router"
import {renderWithSession} from "../lib/auth/test-functions";
import {mockSessionNotInPilot} from "../fixtures/session";

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

document.head.insertAdjacentHTML(
  "afterbegin",
  '<meta http-equiv="XSRF-TOKEN" content="test" />'
)

describe("DiscardDialog", () => {
  describe("when user is in pilot group", () => {
    it("can be opened and closed", () => {
      renderWithSession(<Discard workflowId="foo" />)
      fireEvent.click(screen.getByText("Discard"))
      expect(screen.getByRole("dialog"))
      fireEvent.click(screen.getByText("No, cancel"))
      expect(screen.queryByRole("dialog")).toBeNull()
      expect(fetch).toBeCalledTimes(0)
    })

    it("can correctly trigger the discard handler", async () => {
      renderWithSession(<Discard workflowId="foo" />)
      fireEvent.click(screen.getByText("Discard"))
      fireEvent.click(screen.getByText("Yes, discard"))
      await waitFor(() => {
        expect(fetch).toBeCalledWith("/api/workflows/foo", {
          method: "DELETE",
          headers: { "XSRF-TOKEN": "test" },
        })
      })
    })
  })

  describe("when user is not in pilot group", () => {
    it("doesn't show discard button", () => {
      renderWithSession(<Discard workflowId="foo" />, mockSessionNotInPilot)

      expect(screen.queryByText("Discard")).toBeNull()
      expect(screen.queryByRole("button")).toBeNull()
    })
  })
})
