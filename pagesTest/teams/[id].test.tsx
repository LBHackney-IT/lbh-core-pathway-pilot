import { getServerSideProps } from "../../pages/teams/[id]";
import { makeGetServerSidePropsContext, testGetServerSidePropsAuthRedirect}  from "../../lib/auth/test-functions"
import {
  mockSession,
  mockSessionNotInPilot,
  mockSessionPanelApprover,
  mockSessionApprover,
} from "../../fixtures/session"
import { getSession } from "../../lib/auth/session";
import prisma from "../../lib/prisma"
import { mockUser } from "../../fixtures/users"
import { mockForm } from "../../fixtures/form"

jest.mock("../../lib/prisma", () => ({
  user: {
    findMany: jest.fn(),
  },
}))
;(prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser])

jest.mock("../../lib/auth/session")

describe("pages/teams/[id].getServerSideProps", () => {
  const context = makeGetServerSidePropsContext({query: {id: "test-team"}})
  testGetServerSidePropsAuthRedirect({
    getServerSideProps,
    tests: [
      {
        name: "user is not in pilot group",
        session: mockSessionNotInPilot,
        context,
      },
      {
        name: "user is only an approver",
        session: mockSessionApprover,
        context,
      },
      {
        name: "user is only a panel approver",
        session: mockSessionPanelApprover,
        context,
      },
    ],
  })

  describe ("when a team doesn't exist", ()  => {
    let response 
    beforeAll(async() => {
      (getSession as jest.Mock).mockResolvedValue(mockSession)
       response = await getServerSideProps(
        makeGetServerSidePropsContext({
          query: {
            id: "unknown-id",
          },
          resolvedUrl: "/teams/[id]",
        })
      )
    })
  
    it("returns a not found status", () => {
      expect(response).toHaveProperty("notFound", true)
    })
  })

  describe('when a team does exist', () => {
    let response 
    beforeAll(async() => {
      (getSession as jest.Mock).mockResolvedValue(mockSession)
       response = await getServerSideProps(
        makeGetServerSidePropsContext({
          query: {
            id: "Access",
          },
          resolvedUrl: "/teams/[id]",
        })
      )
    })

    it("filters users by the team", () => {
      expect(prisma.user.findMany).toBeCalledWith({
        where: {
          team: "Access",
        },
        orderBy: {
          name: "asc",
        },
        include: {
          assignments: {
            where: {
              discardedAt: null,
            },
          },
        },
      })
    })

    it("returns the team, users and forms as props", async () => {
      expect(response).toHaveProperty("props", {
          team: "Access",
          users: JSON.parse(JSON.stringify([mockUser])),
          forms: [mockForm],
      })
    })
  })
})

