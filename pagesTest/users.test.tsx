import { getServerSideProps } from "../pages/users"
import {getSession} from "../lib/auth/session"
import {mockUser} from "../fixtures/users"
import prisma from "../lib/prisma"
import {mockSession, mockSessionApprover} from "../fixtures/session";
import {makeGetServerSidePropsContext, testGetServerSidePropsAuthRedirect} from "../lib/auth/test-functions";

jest.mock("../lib/prisma", () => ({
  user: {
    findMany: jest.fn(),
  },
}));
;(prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser])

jest.mock("../lib/auth/session");
(getSession as jest.Mock).mockResolvedValue(mockSession);

describe("pages/users.getServerSideProps", () => {
  testGetServerSidePropsAuthRedirect(
    getServerSideProps,
    true,
    false,
    true,
  );

  describe("when logged in as an approver", () => {
    beforeEach(() => {
      ;(getSession as jest.Mock).mockResolvedValue(mockSessionApprover)
    });

    it("filters historic users", async () => {
      await getServerSideProps(makeGetServerSidePropsContext({}))

      expect(prisma.user.findMany).toBeCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            historic: false,
          }),
        })
      )
    })

    it("orders users by team and then approvers", async () => {
      await getServerSideProps(makeGetServerSidePropsContext({}))

      expect(prisma.user.findMany).toBeCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([
            { team: "asc" },
            { panelApprover: "desc" },
            { approver: "desc" },
            { name: "asc" },
          ]),
        })
      )
    })

    it("includes the last time each user was seen", async () => {
      const response =
        await getServerSideProps(makeGetServerSidePropsContext({}));

      expect(response).toHaveProperty('props', {
        users: expect.arrayContaining([expect.objectContaining({
          lastSeenAt: "2020-10-13T13:15:00.000Z",
        })])
      })
    })
  })
})
