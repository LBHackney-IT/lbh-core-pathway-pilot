import { render, screen } from "@testing-library/react"
import UnlinkedReassessmentPanel from "./UnlinkedReassessmentPanel"

describe("UnlinkedReassessmentPanel", () => {
  it("shows up if an id is selected", () => {
    render(
      <UnlinkedReassessmentPanel
        queryParams={{
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
