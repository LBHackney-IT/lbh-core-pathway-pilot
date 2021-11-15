import { render, screen, fireEvent } from "@testing-library/react"
import { useRouter } from "next/router"
import { mockUser } from "../fixtures/users"
import EditUserDialog from "./EditUserDialog"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

describe("EditUserDialog", () => {
  it("can be opened and closed", () => {
    render(<EditUserDialog user={mockUser} />)
    fireEvent.click(screen.getByText("Edit role"))
    expect(screen.getByRole("dialog"))
    fireEvent.click(screen.getByText("Close"))
    expect(screen.queryByRole("dialog")).toBeNull()
  })
})
