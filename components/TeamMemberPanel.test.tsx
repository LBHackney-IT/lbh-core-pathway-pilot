import { render, screen, fireEvent } from "@testing-library/react"
import { useSession } from "next-auth/client"
import { mockUser } from "../fixtures/users"
import { mockWorkflow } from "../fixtures/workflows"
import TeamMemberPanel from "./TeamMemberPanel"
import { useRouter } from "next/router"
import { mockForms } from "../fixtures/form"
import useAllocations from "../hooks/useAllocations"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  reload: jest.fn(),
})

jest.mock("../hooks/useAllocations")
;(useAllocations as jest.Mock).mockReturnValue({
  data: [],
})

jest
  .spyOn(global.Date, "now")
  .mockImplementation(() => new Date("2020-12-14T00:00:00.000Z").valueOf())

jest.mock("next-auth/client")
;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }, false])

const user = {
  ...mockUser,
  sessions: [
    {
      updatedAt: "2020-11-14T00:00:00.000Z" as unknown as Date,
    },
  ],
  assignments: [mockWorkflow],
}

describe("TeamMemberPanel", () => {
  it("shows basic user biography", () => {
    render(<TeamMemberPanel user={user} forms={mockForms} />)

    expect(screen.getByText("Firstname Surname (you)"))
    expect(screen.getByText("User", { exact: false }))
    expect(screen.getByRole("img"))
  })

  it("shows summary stats about the user", () => {
    render(<TeamMemberPanel user={user} forms={mockForms} />)

    expect(screen.getByText("last seen 1 month ago", { exact: false }))

    expect(screen.getByText("1"))
    expect(screen.getByText("workflow assigned"))
  })

  it("can be opened and closed", () => {
    render(<TeamMemberPanel user={user} forms={mockForms} />)

    fireEvent.click(screen.getByText("Firstname Surname", { exact: false }))
  })

  it("marks yourself differently", () => {
    ;(useSession as jest.Mock).mockReturnValue([
      {
        user: {
          ...mockUser,
          email: "foo.bar@blah.com",
        },
      },
      false,
    ])

    render(<TeamMemberPanel user={user} forms={mockForms} />)

    expect(screen.queryByRole("(you)", { exact: false })).toBeNull()
  })
})
