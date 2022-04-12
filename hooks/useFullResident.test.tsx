import * as SWR from "swr"
import useFullResident from "./useFullResident"

jest.mock("swr")

describe("useFullResident", () => {
  it("expected to call the resident endpoint with a fullView query", () => {
    jest.spyOn(SWR, "default")
    useFullResident("1234")
    expect(SWR.default).toHaveBeenCalledWith("/api/residents/1234?fullView=true")
  })
})
