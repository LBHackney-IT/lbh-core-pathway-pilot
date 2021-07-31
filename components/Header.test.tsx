import { render, screen } from "@testing-library/react"
import Header from "./Header"
import auth from "next-auth/client"

jest.mock("next-auth/client")

;(auth.useSession as jest.Mock).mockReturnValue(() => [
  {
    user: {
      name: "Foo",
    },
  },
  false,
])

describe("Header", () => {
  it("renders correctly when signed in", () => {
    render(<Header />)
    expect(screen.getByText("Foo"))
    expect(screen.getByText("Sign out"))
  })

  it("renders correctly when signed out", () => {
    render(<Header />)
    expect(screen.queryByText("Sign out")).toBeNull()
  })

  //   it("supports full-width layout", () => {
  //     render(<Header fullWidth />)
  //     expect(screen.query)
  //   })
})
