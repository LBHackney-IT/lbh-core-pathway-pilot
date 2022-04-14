import * as SWR from "swr"
import useFullResident from "./useFullResident"

jest.mock("swr")

describe("useFullResident", () => {
  it("expected to call the resident endpoint with a fullView query", () => {
    jest.spyOn(SWR, "default")
    useFullResident("1234")
    expect(SWR.default).toHaveBeenCalledWith("/api/residents/1234?view=full")
  })

  it("when workflow is given expected to call the resident endpoint with a full view and workflow id", () => {
    jest.spyOn(SWR, "default")
    useFullResident("1234", "abc1")
    expect(SWR.default).toHaveBeenCalledWith("/api/residents/1234?view=full&workflowId=abc1")
  })
})
