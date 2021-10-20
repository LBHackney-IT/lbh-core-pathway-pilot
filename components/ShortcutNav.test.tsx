import { render, screen } from "@testing-library/react"
import ShortcutNav from "./ShortcutNav"
import { useSession } from "next-auth/client"
import { mockUser } from "../fixtures/users"

jest.mock("next-auth/client")

describe("ShortcutList", () => {
  it("correctly renders a list of shortcuts", () => {
    ;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }])

    render(<ShortcutNav />)
    expect(screen.getByRole("navigation"))
    expect(screen.getAllByRole("link").length).toBe(3)
  })

  it("shows nothing if there are no shortcuts", () => {
    ;(useSession as jest.Mock).mockReturnValue([
      { user: { ...mockUser, shortcuts: [] } },
    ])

    render(<ShortcutNav />)
    expect(screen.queryByRole("navigation")).toBeNull()
  })

  it("skips shortcuts without a matching option to be found", () => {
    ;(useSession as jest.Mock).mockReturnValue([
      { user: { ...mockUser, shortcuts: ["foo", "su"] } },
    ])

    render(<ShortcutNav />)
    expect(screen.getAllByRole("link").length).toBe(2)
  })

  it("shows an add more link if there are fewer than 4 shortcuts", () => {
    ;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }])

    render(<ShortcutNav />)
    expect(screen.getByText("Add another shortcut"))
  })

  it("shows an add more link if there are 4 shortcuts", () => {
    ;(useSession as jest.Mock).mockReturnValue([
      {
        user: {
          ...mockUser,
          shortcuts: ["foo", "bar", "three", "four"],
        },
      },
    ])

    render(<ShortcutNav />)
    expect(screen.queryByText("Add another shortcut")).toBeNull()
  })
})
