import Unauthorised from "../pages/403"
import { render, screen } from "@testing-library/react"
import { FlashMessages } from "../contexts/flashMessages"
import { mockUser } from "../fixtures/users"
import { useSession } from "next-auth/client"

jest.mock("../contexts/flashMessages")
;(FlashMessages as jest.Mock).mockReturnValue(<></>)

jest.mock("next-auth/client")
;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }, false])

process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL = "http://example.com"

describe("<Unauthorised />", () => {
  it("displays link to sign in with main social care tool", () => {
    render(<Unauthorised />)

    expect(screen.getByText("main social care tool")).toBeVisible()
    expect(screen.getByText("main social care tool")).toHaveAttribute(
      "href",
      "http://example.com/login"
    )
  })

  it("displays link to feedback form", () => {
    render(<Unauthorised />)

    expect(screen.getByText("let us know")).toBeVisible()
    expect(screen.getByText("let us know")).toHaveAttribute(
      "href",
      "https://forms.gle/pVuBfxcm2kqxT8D68"
    )
  })
})
