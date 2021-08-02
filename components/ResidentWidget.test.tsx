import ResidentWidget from "./ResidentWidget"
import { render } from "@testing-library/react"
import { mockResident } from "../fixtures/residents"
import swr from "swr"

jest.mock("swr")
;(swr as jest.Mock).mockReturnValue({
  data: mockResident,
})

describe("ResidentWidget", () => {
  it("calls the hook correctly", () => {
    render(
      <ResidentWidget socialCareId={"1"} />
    )
    expect(swr).toBeCalledWith("/api/residents/1")
  })

  it("renders correctly when there is a person", () => {
    const { getByText, queryByText } = render(
      <ResidentWidget socialCareId={""} />
    )
    expect(getByText("Firstname Surname"))
    expect(getByText("Born 1 Oct 2000"))
    expect(queryByText("123 Town St"))
    expect(queryByText("W1A"))
  })

  it("should handle when there is no date of birth", () => {
    const { queryByText } = render(<ResidentWidget socialCareId={""} />)
    expect(queryByText("Born")).toBeNull()
  })
})
