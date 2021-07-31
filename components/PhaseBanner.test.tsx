import { render, screen } from "@testing-library/react"
import PhaseBanner from "./PhaseBanner"

describe("PhaseBanner", () => {
  it("supports regular layout", () => {
    render(<PhaseBanner />)
    expect(screen.getByTestId("full-width-container")).not.toHaveClass(
      "lmf-full-width"
    )
  })

  it("supports full-width layout", () => {
    render(<PhaseBanner fullWidth />)
    expect(screen.getByTestId("full-width-container")).toHaveClass(
      "lmf-full-width"
    )
  })
})
