import { handler } from "../../../pages/api/users"
import { NextApiResponse } from "next"
import prisma from "../../../lib/prisma"
import { mockUser } from "../../../fixtures/users"
import {
  makeNextApiRequest,
  testApiHandlerUnsupportedMethods,
} from "../../../lib/auth/test-functions"
import { mockSession, mockSessionApprover } from "../../../fixtures/session"

jest.mock("../../../lib/prisma", () => ({
  user: {
    findMany: jest.fn(),
    update: jest.fn(),
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

describe("when the HTTP method is PATCH", () => {
  describe("when the user isn't approver", () => {
    it("returns 401 and error message", async () => {
      const response = {
        status: jest.fn().mockImplementation(() => response),
        json: jest.fn(),
      } as unknown as NextApiResponse

      await handler(
        makeNextApiRequest({
          method: "PATCH",
          session: mockSession,
        }),
        response
      )

      expect(response.status).toBeCalledWith(401)
      expect(response.json).toBeCalledWith({
        error: "You're not authorised to perform that action",
      })
    })
  })

  describe("when the user is an approver", () => {
    const response = {
      status: jest.fn().mockImplementation(() => response),
      json: jest.fn(),
    } as unknown as NextApiResponse
    const mockUser1 = {
      ...mockUser,
      id: "idOfUserWithChangedApprover",
      email: "test@example.com",
    }
    const mockUser2 = {
      ...mockUser,
      id: "idOfUserWithNoTeam",
      email: "another.test@example.com",
    }

    beforeAll(async () => {
      ;(prisma.user.update as jest.Mock).mockResolvedValueOnce({
        ...mockUser1,
        approver: !mockUser1.approver,
      })
      ;(prisma.user.update as jest.Mock).mockResolvedValueOnce({
        ...mockUser2,
        team: null,
      })

      await handler(
        makeNextApiRequest({
          method: "PATCH",
          session: mockSessionApprover,
          body: {
            idOfUserWithChangedApprover: {
              email: mockUser1.email,
              team: mockUser1.team,
              approver: !mockUser1.approver,
              panelApprover: mockUser1.panelApprover,
            },
            idOfUserWithNoTeam: {
              email: mockUser2.email,
              approver: mockUser2.approver,
              panelApprover: mockUser2.panelApprover,
            },
          },
        }),
        response
      )
    })

    it("calls Prisma to update each user", () => {
      expect(prisma.user.update).toBeCalledWith({
        where: expect.objectContaining({
          id: "idOfUserWithChangedApprover",
        }),
        data: {
          email: mockUser1.email,
          team: mockUser1.team,
          approver: !mockUser1.approver,
          panelApprover: mockUser1.panelApprover,
        },
      })
      expect(prisma.user.update).toBeCalledWith({
        where: expect.objectContaining({
          id: "idOfUserWithNoTeam",
        }),
        data: {
          email: mockUser2.email,
          team: null,
          approver: mockUser2.approver,
          panelApprover: mockUser2.panelApprover,
        },
      })
    })

    it("returns updated users", () => {
      expect(response.json).toBeCalledWith(
        expect.arrayContaining([
          {
            ...mockUser1,
            approver: !mockUser1.approver,
          },
          {
            ...mockUser2,
            team: null,
          },
        ])
      )
    })
  })
})
