import { render, screen, fireEvent } from "@testing-library/react"
import { mockComment } from "../fixtures/comments"
import { mockUser } from "../fixtures/users"
import Comments from "./Comments"
import { useRouter } from "next/router"
import { Action } from "@prisma/client"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  replace: jest.fn(),
})

const mockComments = [
  {
    ...mockComment,
    creator: mockUser,
  },
  {
    ...mockComment,
    id: "aaaa",
    creator: mockUser,
  },
]

describe("Comments", () => {
  it("can be opened and closed", () => {
    render(<Comments comments={mockComments} />)
    expect(screen.getByRole("list"))
    fireEvent.click(screen.getByText("Hide comments (2)"))
    expect(screen.queryByRole("list")).toBeNull()
    fireEvent.click(screen.getByText("Show comments (2)"))
  })

  it("shows a list of comments with the creator's name", () => {
    render(<Comments comments={mockComments} />)

    expect(screen.getAllByRole("listitem").length).toBe(2)
    expect(screen.getAllByText("example comment text").length).toBe(2)
    expect(
      screen.getAllByText("Firstname Surname", { exact: false }).length
    ).toBe(2)
  })

  it("displays 'Approved' if action is approved", () => {
    render(
      <Comments
        comments={[
          {
            ...mockComment,
            action: Action.Approved,
            creator: mockUser,
          },
        ]}
      />
    )

    expect(
      screen.getByText("Approved by Firstname Surname", { exact: false })
    ).toBeVisible()
  })

  it("displays 'Changes requested' if action is returned for edits", () => {
    render(
      <Comments
        comments={[
          {
            ...mockComment,
            action: Action.ReturnedForEdits,
            creator: mockUser,
          },
        ]}
      />
    )

    expect(
      screen.getByText("Changes requested by Firstname Surname", {
        exact: false,
      })
    ).toBeVisible()
  })

  it("displays 'Changes requested' if action is edited", () => {
    render(
      <Comments
        comments={[
          {
            ...mockComment,
            action: Action.Edited,
            creator: mockUser,
          },
        ]}
      />
    )

    expect(
      screen.getByText("Changes requested by Firstname Surname", {
        exact: false,
      })
    ).toBeVisible()
  })
})
