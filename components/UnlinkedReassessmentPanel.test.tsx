import { render, screen } from "@testing-library/react"
import UnlinkedReassessmentPanel from "./UnlinkedReassessmentPanel"

describe("UnlinkedReassessmentPanel", () => {
  it("shows up if an id is selected", () => {
    render(<UnlinkedReassessmentPanel socialCareId="foo" />)
    expect((screen.getByRole("link") as HTMLAnchorElement).href).toContain(
      "/workflows/new?social_care_id=foo"
    )
  })
})
