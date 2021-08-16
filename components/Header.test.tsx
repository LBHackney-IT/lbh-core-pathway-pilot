import { render, screen } from "@testing-library/react"
import Header from "./Header"
import { useSession } from "next-auth/client"
import { mockApprover } from "../fixtures/users"

jest.mock("next-auth/client")

beforeEach(() => {
  ;(useSession as jest.Mock).mockReturnValue([false, false])
})

describe("Header", () => {
  it("renders correctly when signed in", () => {
    ;(useSession as jest.Mock).mockReturnValue([
      {
        user: {
          name: "Foo",
        },
      },
      false,
    ])
    render(<Header />)
    expect(screen.getByText("Foo"))
    expect(screen.getByText("Sign out"))
    expect(screen.queryByText("Users")).toBeNull()
  })

  it("renders correctly when signed out", () => {
    render(<Header />)
    expect(screen.queryByText("Sign out")).toBeNull()
  })

  it("supports regular layout", () => {
    render(<Header />)
    expect(screen.getByTestId("full-width-container")).not.toHaveClass(
      "lmf-full-width"
    )
  })

  it("supports full-width layout", () => {
    render(<Header fullWidth />)
    expect(screen.getByTestId("full-width-container")).toHaveClass(
      "lmf-full-width"
    )
  })

  it("shows extra content for approvers only", () => {
    ;(useSession as jest.Mock).mockReturnValue([
      {
        user: mockApprover,
      },
      false,
    ])
    render(<Header />)
    expect(screen.getByText("Users"))
  })
})
