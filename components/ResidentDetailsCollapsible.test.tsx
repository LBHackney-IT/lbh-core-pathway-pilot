import { render, screen, fireEvent } from "@testing-library/react"
import ResidentDetailsCollapsible from "./ResidentDetailsCollapsible"
import { mockResident } from "../fixtures/residents"
import useResident from "../hooks/useResident"
import { prettyResidentName } from "../lib/formatters"

jest.mock("../hooks/useResident")
;(useResident as jest.Mock).mockReturnValue({ data: mockResident })

describe("ResidentDetailsCollapsible", () => {
  it("can be opened and closed", () => {
    render(<ResidentDetailsCollapsible socialCareId="foo" />)
    fireEvent.click(screen.getByRole("button"))
    expect(screen.queryByText(prettyResidentName(mockResident))).toBeNull()
    fireEvent.click(screen.getByRole("button"))
    expect(screen.getByText(prettyResidentName(mockResident)))
  })
})
