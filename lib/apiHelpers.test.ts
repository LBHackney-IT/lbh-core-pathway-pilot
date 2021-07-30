import { getSession } from "next-auth/client"
import { apiHandler } from "./apiHelpers"

jest.mock("next-auth/client")

const mockHandler = jest.fn()

const mockReq = {
  cookies: jest.fn(),
}

const mockJson = jest.fn()
const mockStatus = jest.fn(() => {
  return {
    json: mockJson,
  }
})
const mockRes = {
  status: mockStatus,
}

;(getSession as jest.Mock)
  .mockReturnValueOnce(false)
  .mockReturnValueOnce(true)
  .mockReturnValueOnce(true)

describe("apiHandler", () => {
  it("responds with an appropriate error if there is no session", async () => {
    await apiHandler(mockHandler)(mockReq as any, mockRes as any)

    expect(mockHandler).not.toBeCalled()

    expect(mockStatus).toBeCalledWith(401)
    expect(mockJson).toBeCalledWith({
      error: "Not authenticated",
    })
  })

  it("returns the endpoint handler if there is a session", async () => {
    await apiHandler(mockHandler)(mockReq as any, mockRes as any)
    expect(mockHandler).toBeCalled()
  })

  it("catches errors", async () => {
    await apiHandler(() => {
      throw "example error"
    })(mockReq as any, mockRes as any)

    expect(mockHandler).toBeCalled()

    expect(mockStatus).toBeCalledWith(500)
    expect(mockJson).toBeCalledWith({
      error: "example error",
    })
  })
})
