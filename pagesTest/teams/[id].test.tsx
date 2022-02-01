
import { getServerSideProps } from "../../pages/teams/[id]";
import { makeGetServerSidePropsContext, testGetServerSidePropsAuthRedirect}  from "../../lib/auth/test-functions"
import { ServerResponse } from "http";
import {
  mockSession,
  mockSessionNotInPilot,
  mockSessionPanelApprover,
  mockSessionApprover,
} from "../../fixtures/session"
import { getSession } from "../../lib/auth/session";

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
    const res = {} as ServerResponse
    beforeAll(async() => {
      (getSession as jest.Mock).mockResolvedValue(mockSession)
       await getServerSideProps(
        makeGetServerSidePropsContext({
          query: {
            id: "unknown-id",
          },
          resolvedUrl: "/teams/[id]",
          res
        })
      )
    })
  
    it("returns a not found status", () => {
      expect(res).toHaveProperty("statusCode", 404)
    })
  })
})

