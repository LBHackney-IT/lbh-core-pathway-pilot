import { render, screen } from "@testing-library/react"
import Breadcrumbs from "./Breadcrumbs"

const mockCrumbs = [
  {
    href: "/",
    text: "foo",
  },
  {
    href: "/",
    text: "bar",
    current: true,
  },
]

describe("Breadcrumbs", () => {
  it("renders a list of crumbs", () => {
    render(<Breadcrumbs crumbs={mockCrumbs} />)
    expect(screen.getByText("foo"))
    expect(screen.getByText("bar"))
    expect(screen.getAllByRole("listitem").length).toBe(2)
  })

  it("renders the current crumb without a link", () => {
    render(<Breadcrumbs crumbs={mockCrumbs} />)
    expect(screen.getAllByRole("link").length).toBe(1)
  })

  it("supports regular layout", () => {
    render(<Breadcrumbs crumbs={mockCrumbs} />)
    expect(screen.getByTestId("full-width-container")).not.toHaveClass(
      "lmf-full-width"
    )
  })

  it("supports full-width layout", () => {
    render(<Breadcrumbs crumbs={mockCrumbs} fullWidth />)
    expect(screen.getByTestId("full-width-container")).toHaveClass(
      "lmf-full-width"
    )
  })
})
