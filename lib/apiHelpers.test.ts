import {getSession, UserNotLoggedIn} from "./auth/session";
import { apiHandler } from "./apiHelpers"
import {NextApiResponse} from "next"
import {pilotGroup} from "../config/allowedGroups";
import {mockSession, mockSessionNotInPilot} from "../fixtures/session";
import {HttpMethod, makeNextApiRequest} from "./auth/test-functions";

jest.mock('./auth/session');
const mockHandler = jest.fn()
const mockJson = jest.fn()
const mockStatus = jest.fn(() => {
  return {
    json: mockJson,
  }
})
const mockRes = {
  status: mockStatus,
}

describe("apiHandler", () => {
  beforeEach(() => {
    mockStatus.mockClear()
    mockHandler.mockClear()
    mockJson.mockClear()
  })

  it("responds with an appropriate error if there is no session", async () => {
    ;(getSession as jest.Mock).mockRejectedValueOnce(new UserNotLoggedIn());

    await apiHandler(mockHandler)(
      makeNextApiRequest({}),
      mockRes as unknown as NextApiResponse
    )

    expect(mockHandler).not.toBeCalled()
    expect(mockStatus).toBeCalledWith(401)
    expect(mockJson).toBeCalledWith({
      error: "Not authenticated",
    })
  })

  describe("when user is in the pilot group", () => {
    beforeAll(() => {
      ;(getSession as jest.Mock).mockResolvedValue(mockSession)
    })

    ;["GET", "POST", "PUT", "PATCH", "DELETE"].forEach(method => {
      it(`calls the endpoint handler if HTTP method is ${method}`, async () => {
        await apiHandler(mockHandler, [pilotGroup])(
          makeNextApiRequest({}),
          mockRes as unknown as NextApiResponse,
        )

        expect(mockHandler).toBeCalled();
      })
    })

    it("throws errors", async () => {
      const mockErrorHandler = jest
        .fn()
        .mockRejectedValue(new Error("example error"))

      await expect(apiHandler(mockErrorHandler)(
        makeNextApiRequest({}),
        mockRes as unknown as NextApiResponse
      )).rejects.toEqual(new Error('example error'));

      expect(mockErrorHandler).toBeCalled()
    })
  })

  describe("when user is not in the pilot group", () => {
    beforeEach(() => {
      ;(getSession as jest.Mock).mockResolvedValue(mockSessionNotInPilot)
    })

    it("calls the endpoint handler if HTTP method is GET", async () => {
      await apiHandler(mockHandler, [pilotGroup], ['GET'])(
        makeNextApiRequest({session: mockSessionNotInPilot}),
        mockRes as unknown as NextApiResponse
      )

      expect(mockHandler).toBeCalled()
    })

    ;["POST", "PUT", "PATCH", "DELETE"].forEach(method => {
      it(`returns 403 if HTTP method is ${method}`, async () => {
        await apiHandler(mockHandler, [pilotGroup], ['GET'])(
          makeNextApiRequest({
            method: method as HttpMethod,
            session: mockSessionNotInPilot
          }),
          mockRes as unknown as NextApiResponse
        )

        expect(mockStatus).toBeCalledWith(403)
        expect(mockJson).toBeCalledWith({
          error:
            "Not authorised. You are logged in, but not allowed to perform this operation.",
        })
      })
    })

    it("throws errors", async () => {
      const mockErrorHandler = jest
        .fn()
        .mockRejectedValue(new Error("example error"))

      await expect(apiHandler(mockErrorHandler)(
        makeNextApiRequest({}),
        mockRes as unknown as NextApiResponse,
      )).rejects.toEqual(new Error('example error'));

      expect(mockErrorHandler).toHaveBeenCalled();
    })
  })
})
