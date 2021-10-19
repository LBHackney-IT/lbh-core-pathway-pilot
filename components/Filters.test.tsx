import { render, screen } from "@testing-library/react"
import Filters from "./Filters"
import forms from "../config/forms"
import { useSession } from "next-auth/client"
import { useRouter } from "next/router"
import { mockApprover } from "../fixtures/users"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

jest.mock("next-auth/client")
;(useSession as jest.Mock).mockReturnValue([false, false])

beforeEach(() => {
  delete window.location
  window.location = {
    origin: "foo",
    pathname: "bar",
    search: "status=REVIEWSOON",
  } as Location
})

describe("Filters", () => {
  it("shows filters for status, form id and review/reassessments", async () => {
    render(<Filters forms={await forms()} />)
    expect(screen.getByLabelText("Filter by assessment"))
    expect(screen.getByLabelText("Filter by status"))
    expect(screen.getByLabelText("Sort by"))
    expect(screen.getByLabelText("Only show reassessments"))
    expect(screen.getByLabelText("Only show workflows created by me"))
  })

  it("shows a link to discarded workflows for approvers only", async () => {
    ;(useSession as jest.Mock).mockReturnValue([
      {
        user: mockApprover,
      },
    ])
    render(<Filters forms={await forms()} />)
    expect(screen.getByText("See discarded workflows"))
  })

  it("accepts values passed from the url query", async () => {
    render(<Filters forms={await forms()} />)
    expect(screen.getByDisplayValue("Review soon"))
  })
})
