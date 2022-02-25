import * as SWR from "swr"
import useAnswerFilters from "./useAnswerFilters"

jest.mock("swr")

describe("useAnswerFilters", () => {
  it("calls the expected endpoint", () => {
    jest.spyOn(SWR, "default")
    useAnswerFilters()
    expect(SWR.default).toHaveBeenCalledWith("/api/content/filters")
  })
})
