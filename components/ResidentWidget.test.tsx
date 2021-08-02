import ResidentWidget from "./ResidentWidget"
import { render } from "@testing-library/react"
import { mockResident } from "../fixtures/residents"

const resident = mockResident

describe("ResidentWidget", () => {
  it("renders correctly when there is a person", () => {
    const { getByText, queryByText } = render(
      <ResidentWidget resident={resident} />
    )
    expect(getByText("Firstname Surname"))
    expect(getByText("Born 1 Oct 2000"))
    expect(queryByText("123 Town St"))
    expect(queryByText("W1A"))
  })

  it("should handle when there is no date of birth", () => {
    const { queryByText } = render(<ResidentWidget resident={resident} />)
    expect(queryByText("Born")).toBeNull()
  })

  it("should handle when there is an invalid date of birth", () => {
    resident.dateOfBirth = "this is not a date"
    const { getByText, queryByText } = render(
      <ResidentWidget resident={resident} />
    )
    expect(getByText("Firstname Surname"))
    expect(queryByText("Born")).toBeNull()
  })

  it("should handle when there is no address", () => {
    resident.addressList = []
    const { queryByText } = render(<ResidentWidget resident={resident} />)
    expect(queryByText("123 Town St")).toBeNull()
  })
})
