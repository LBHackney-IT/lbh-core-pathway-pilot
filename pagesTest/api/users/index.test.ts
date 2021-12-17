import { handler } from "../../../pages/api/users"
import {NextApiRequest, NextApiResponse} from "next"
import prisma from "../../../lib/prisma"
import { mockUser } from "../../../fixtures/users"

jest.mock("../../../lib/prisma", () => ({
  user: {
    findMany: jest.fn(),
  },
}))

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
    const request = {
      method: "GET",
      session: { user: mockUser },
    } as unknown as NextApiRequest

    await handler(request, response)

    expect(prisma.user.findMany).toBeCalledWith({
      where: expect.objectContaining({
        historic: false,
      }),
      orderBy: expect.anything(),
    })
  })

  it("doesn't filter historic users if historic query param is provided", async () => {
    const request = {
      method: "GET",
      session: { user: mockUser },
      query: { historic: true },
    } as unknown as NextApiRequest

    await handler(request, response)

    expect(prisma.user.findMany).toBeCalledWith({
      where: expect.objectContaining({
        historic: undefined,
      }),
      orderBy: expect.anything(),
    })
  })

  it("returns users", async () => {
    const request = {
      method: "GET",
      session: { user: mockUser },
    } as unknown as NextApiRequest

    await handler(request, response)

    expect(response.json).toBeCalledWith([mockUser])
  })
})

describe("when invalid HTTP methods", () => {
  ;["POST", "PUT", "DELETE"].forEach(method => {
    const response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn(),
    } as unknown as NextApiResponse

    it(`returns 405 for ${method}`, async () => {
      const request = { method: method } as unknown as NextApiRequest

      await handler(request, response)

      expect(response.status).toHaveBeenCalledWith(405)
      expect(response.json).toHaveBeenCalledWith({
        error: "Method not supported on this endpoint",
      })
    })
  })
})
