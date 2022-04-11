import { render, screen, fireEvent } from "@testing-library/react"
import ResidentDetailsCollapsible from "./ResidentDetailsCollapsible"
import { mockSuperResident } from "../fixtures/superResidents"
import useSuperResident from "../hooks/useSuperResident"

jest.mock("../hooks/useSuperResident")
;(useSuperResident as jest.Mock).mockReturnValue({ data: mockSuperResident })

describe("ResidentDetailsCollapsible", () => {
  it("can be opened and closed", () => {
    render(<ResidentDetailsCollapsible socialCareId="foo" />)
    fireEvent.click(screen.getByRole("button"))
    expect(screen.queryByText(mockSuperResident.firstName)).toBeNull()
    expect(screen.queryByText(mockSuperResident.lastName)).toBeNull()
    fireEvent.click(screen.getByRole("button"))
    expect(screen.getByText(mockSuperResident.firstName)).toBeVisible()
    expect(screen.getByText(mockSuperResident.lastName)).toBeVisible()
  })
})
