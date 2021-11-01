import { render, screen } from "@testing-library/react"
import { Status } from "../types"
import UnlinkedReassessmentPanel from "./UnlinkedReassessmentPanel"

describe("UnlinkedReassessmentPanel", () => {
  it("shows up if no action is the status filter and an id is selected", () => {
    render(
      <UnlinkedReassessmentPanel
        queryParams={{
          status: Status.NoAction,
          social_care_id: "foo",
        }}
      />
    )
    expect(screen.getByRole("heading"))
  })

  it("shows up if review soon is the status filter and an id is selected", () => {
    render(
      <UnlinkedReassessmentPanel
        queryParams={{
          status: Status.ReviewSoon,
          social_care_id: "foo",
        }}
      />
    )
    expect(screen.getByRole("heading"))
  })

  it("shows up if review soon is the status filter", () => {
    render(<UnlinkedReassessmentPanel queryParams={{}} />)
    expect(screen.queryByRole("heading")).toBeNull()
  })
})
