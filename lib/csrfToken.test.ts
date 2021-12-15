import { CSRFValidationError, init } from "./csrfToken"
import { NextApiRequest, NextApiResponse } from "next"
import {makeNextApiRequest} from "./auth/test-functions";
import {mockSession} from "../fixtures/session";

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  res.status(200).json({})
}

process.env.CSRF_SECRET =
  "test-secret-test-secret-test-secret-test-secret-test-secret-test-secret-test-secret-test-secret-test-secret-test-secret-secret!?"

const csrf = init()
const csrf2 = init()

describe("validate", () => {
  test("when the token is valid", () => {
    expect(() => csrf.validate(csrf.token())).not.toThrow()
  })
  test("when the token is invalid", () => {
    expect(() => csrf.validate("not-a-valid-token")).toThrow(
      CSRFValidationError
    )
  })
  test("when the token is generate by another instance", () => {
    expect(() => csrf.validate(csrf2.token())).not.toThrow()
  })
})

describe("middleware", () => {
  const csrfHandler = csrf.middleware(handler)
  let response: NextApiResponse

  beforeEach(() => {
    response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn(),
    } as unknown as NextApiResponse
  })

  describe("a valid request", () => {
    test("allows the request through", async () => {
      await csrfHandler(makeNextApiRequest({
        method: "POST",
        session: mockSession,
        headers: {
          "xsrf-token": csrf.token(),
        },
      }), response)

      expect(response.status).toHaveBeenCalledWith(200)
    })
  })

  describe("an invalid request", () => {
    const error = console.error

    beforeAll(() => {
      console.error = jest.fn()
    })
    afterAll(() => {
      console.error = error
    })

    test("stops a request with no header", async () => {
      await csrfHandler(makeNextApiRequest({
        method: "POST",
        session: mockSession,
        url: "/test-url",
      }), response)

      expect(response.status).toHaveBeenCalledWith(403)
      expect(response.json).toHaveBeenCalledWith({
        error: "invalid csrf token",
      })
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(
          "[xsrf][error] invalid token on request to /test-url: invalid csrf token provided"
        )
      )
    })

    test("stops a request with an invalid token", async () => {
      await csrfHandler(makeNextApiRequest({
        method: "POST",
        body: JSON.stringify({}),
        session: mockSession,
        headers: { "XSRF-TOKEN": "invalid-token" },
        url: "/test-url",
      }), response);

      expect(response.status).toHaveBeenCalledWith(403)
      expect(response.json).toHaveBeenCalledWith({
        error: "invalid csrf token",
      })
      expect(console.error).toHaveBeenCalledWith(
        "[xsrf][error] invalid token on request to /test-url: invalid csrf token provided"
      )
    })
  })
})
