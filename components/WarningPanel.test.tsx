import { render, screen } from "@testing-library/react"
import WarningPanel from "./WarningPanel"

describe("WarningPanel", () => {
  it("renders its children", () => {
    render(<WarningPanel>Bar</WarningPanel>)
    expect(screen.getByText("Bar"))
  })
})
