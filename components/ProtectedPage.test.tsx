import { render, screen } from "@testing-library/react"
import ProtectedPage from "./ProtectedPage"
import { useSession } from "next-auth/client"
import { useRouter } from "next/router"

const mockReplace = jest.fn()

jest.mock("next-auth/client")
jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  pathname: "/",
  replace: mockReplace,
})

beforeEach(() => {
  jest.clearAllMocks()
})

describe("Header", () => {
  it("renders correctly for logged in users", () => {
    ;(useSession as jest.Mock).mockReturnValue([
      {
        user: {
          name: "Foo",
        },
      },
      false,
    ])
    render(
      <ProtectedPage>
        <>Foo</>
      </ProtectedPage>
    )
    expect(screen.getByText("Foo"))
    expect(mockReplace).not.toBeCalled()
  })

  it("redirects logged out users", () => {
    ;(useSession as jest.Mock).mockReturnValue([false, false])
    render(
      <ProtectedPage>
        <>Foo</>
      </ProtectedPage>
    )
    expect(screen.queryByText("Foo")).toBeNull()
    expect(mockReplace).toBeCalledTimes(1)
  })

  it("allows logged out users to access public paths", () => {
    ;(useRouter as jest.Mock).mockReturnValue({
      pathname: "/sign-in",
      replace: mockReplace,
    })
    ;(useSession as jest.Mock).mockReturnValue([false, false])
    render(
      <ProtectedPage>
        <>Foo</>
      </ProtectedPage>
    )
    expect(screen.getByText("Foo"))
    expect(mockReplace).not.toBeCalled()
  })
})
