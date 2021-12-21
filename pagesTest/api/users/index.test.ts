import { handler } from "../../../pages/api/users"
import { NextApiResponse } from "next"
import prisma from "../../../lib/prisma"
import { mockUser } from "../../../fixtures/users"
import {
  makeNextApiRequest,
  testApiHandlerUnsupportedMethods,
} from "../../../lib/auth/test-functions"
import { mockSession } from "../../../fixtures/session"

jest.mock("../../../lib/prisma", () => ({
  user: {
    findMany: jest.fn(),
  },
}))

testApiHandlerUnsupportedMethods(handler, ["GET", "PATCH"])

describe("when the HTTP method is GET", () => {
  let response

  beforeEach(() => {
    ;(prisma.user.findMany as jest.Mock).mockClear()
    ;(prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser])

    response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn(),
    } as unknown as NextApiResponse
  })

  it("filters historic users if historic query param is not provided", async () => {
    await handler(
      makeNextApiRequest({
        method: "GET",
        session: mockSession,
      }),
      response
    )

    expect(prisma.user.findMany).toBeCalledWith({
      where: expect.objectContaining({
        historic: false,
      }),
      orderBy: expect.anything(),
    })
  })

  it("doesn't filter historic users if historic query param is provided", async () => {
    await handler(
      makeNextApiRequest({
        method: "GET",
        session: mockSession,
        query: { historic: "true" },
      }),
      response
    )

    expect(prisma.user.findMany).toBeCalledWith({
      where: expect.objectContaining({
        historic: undefined,
      }),
      orderBy: expect.anything(),
    })
  })

  it("returns users", async () => {
    await handler(
      makeNextApiRequest({
        method: "GET",
        session: mockSession,
      }),
      response
    )

    expect(response.json).toBeCalledWith([mockUser])
  })
})
