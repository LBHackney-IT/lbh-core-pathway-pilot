import { render, screen, fireEvent } from "@testing-library/react"
import ResidentDetailsCollapsible from "./ResidentDetailsCollapsible"
import { mockFullResident } from "../fixtures/fullResidents"
import useFullResident from "../hooks/useFullResident"

jest.mock("../hooks/useFullResident")
;(useFullResident as jest.Mock).mockReturnValue({ data: mockFullResident })

describe("ResidentDetailsCollapsible", () => {
  it("can be opened and closed", () => {
    render(<ResidentDetailsCollapsible socialCareId="foo" />)
    fireEvent.click(screen.getByRole("button"))
    expect(screen.queryByText(mockFullResident.firstName)).toBeNull()
    expect(screen.queryByText(mockFullResident.lastName)).toBeNull()
    fireEvent.click(screen.getByRole("button"))
    expect(screen.getByText(mockFullResident.firstName)).toBeVisible()
    expect(screen.getByText(mockFullResident.lastName)).toBeVisible()
  })
})
