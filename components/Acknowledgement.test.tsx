import Acknowledgement from "./Acknowledgement"
import {render, screen, fireEvent, waitFor} from "@testing-library/react"
import {useRouter} from "next/router"
import {renderWithSession} from "../lib/auth/test-functions";

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

document.head.insertAdjacentHTML(
  "afterbegin",
  '<meta http-equiv="XSRF-TOKEN" content="test" />'
)

describe("Acknowledgment", () => {
  describe("when user is in pilot group", () => {
    it("can be opened and closed", () => {
      renderWithSession(<Acknowledgement workflowId="foo"/>);
      fireEvent.click(screen.getByText("Acknowledge"))
      expect(screen.getByRole("dialog"))
      fireEvent.click(screen.getByText("Close"))
      expect(screen.queryByRole("dialog")).toBeNull()
      expect(fetch).toBeCalledTimes(0)
    })

    it("can correctly trigger the acknowledgement handler", async () => {
      renderWithSession(<Acknowledgement workflowId="foo"/>);
      fireEvent.click(screen.getByText("Acknowledge"))
      fireEvent.click(screen.getByText("Direct payments"))
      fireEvent.click(screen.getAllByText("Acknowledge")[1])
      await waitFor(() => {
        expect(fetch).toBeCalledWith("/api/workflows/foo/acknowledgement", {
          method: "POST",
          body: JSON.stringify({
            financeTeam: "DirectPayments",
          }),
          headers: {"XSRF-TOKEN": "test"},
        })
      })
    })
  })

  describe("when user is not in pilot group", () => {
    it("doesn't show button", () => {
      render(<Acknowledgement workflowId="foo"/>)

      expect(screen.queryByText("Acknowledge")).toBeNull()
      expect(screen.queryByRole("button")).toBeNull()
    })
  })
})
