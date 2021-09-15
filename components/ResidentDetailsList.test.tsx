import { render, screen } from "@testing-library/react"
import { mockResident } from "../fixtures/residents"
import ResidentDetailsList from "./ResidentDetailsList"

describe("ResidentDetailsList", () => {
  it("renders basic info", () => {
    render(<ResidentDetailsList resident={mockResident} />)
    expect(screen.getByText("Name"))
    expect(screen.getByText("Firstname Surname"))
  })

  it("marks not known fields", () => {
    render(
      <ResidentDetailsList
        resident={{
          ...mockResident,
          nhsNumber: null,
        }}
      />
    )
    expect(screen.getByText("Not known"))
  })

  it("renders lists of info", () => {
    render(<ResidentDetailsList resident={mockResident} />)
    expect(screen.getByText("Addresses"))
    expect(screen.getByText("Phone numbers"))
    expect(screen.getAllByRole("list").length).toBe(2)
    expect(screen.getAllByRole("listitem").length).toBe(3)
  })

  it("filters out historic addresses", () => {
    render(
      <ResidentDetailsList
        resident={{
          ...mockResident,
          addressList: [
            {
              addressLine1: "add1",
            },
            {
              addressLine1: "add2",
              endDate: "blah",
            },
          ],
        }}
      />
    )
    expect(screen.getByText("add1", { exact: false }))
    expect(screen.queryByText("add2", { exact: false })).toBeNull()
  })
})
