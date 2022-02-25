import * as SWR from "swr"
import useNextSteps from "./useNextSteps"

jest.mock("swr")

describe("useNextSteps", () => {
  it("calls the expected endpoint", () => {
    jest.spyOn(SWR, "default")
    useNextSteps()
    expect(SWR.default).toHaveBeenCalledWith("/api/content/next-steps")
  })
})
