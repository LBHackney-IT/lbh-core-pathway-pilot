import { render, screen } from "@testing-library/react"
import PageAnnouncement from "./PageAnnouncement"

describe("PageAnnouncement", () => {
  it("renders a title and children", () => {
    render(<PageAnnouncement title="Foo">Bar</PageAnnouncement>)
    expect(screen.getByRole("heading"))
    expect(screen.getByText("Foo"))
    expect(screen.getByText("Bar"))
  })

  it("renders a custom class name", () => {
    render(
      <PageAnnouncement title="Foo" className="test-class">
        Bar
      </PageAnnouncement>
    )
    expect(screen.getByTestId("page-announcement")).toHaveClass("test-class")
  })
})
