import {GetServerSidePropsContext} from "next"
import {mockForm} from "../../fixtures/form"
import {mockResident} from "../../fixtures/residents"
import {mockWorkflowWithExtras} from "../../fixtures/workflows"
import {ParsedUrlQuery} from "querystring"
import {getResidentById} from "../../lib/residents"
import {getServerSideProps} from "../../pages/residents/[socialCareId]"
import {getLoginUrl, getSession, UserNotLoggedIn} from "../../lib/auth/session";
import {mockApprover} from "../../fixtures/users"
import {mockSession} from "../../fixtures/session";
import {makeGetServerSidePropsContext} from "../../lib/auth/test-functions";

jest.mock("../../lib/prisma", () => ({
  workflow: {
    findMany: jest.fn().mockResolvedValue([mockWorkflowWithExtras]),
  },
}))

jest.mock("../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock('../../lib/auth/session');
(getSession as jest.Mock).mockResolvedValue(mockSession);
(getLoginUrl as jest.Mock).mockImplementation((url = '') => `auth-server${url}`);

describe("getServerSideProps", () => {
  describe("when not authenticated", () => {
    beforeEach(() => {
      ;(getSession as jest.Mock).mockRejectedValueOnce(new UserNotLoggedIn);
    })

    it("returns a redirect to the auth server", async () => {
      const response = await getServerSideProps(
        {query: {}, req: {}} as GetServerSidePropsContext
      );

      expect(response).toHaveProperty(
        "redirect",
        expect.objectContaining({
          destination: "auth-server",
        })
      )
    })

    it("returns a redirect to the sign-in page that will redirect to another on login", async () => {
      const response = await getServerSideProps(makeGetServerSidePropsContext({
        resolvedUrl: "/some/random/page"
      }));

      expect(response).toHaveProperty(
        "redirect",
        expect.objectContaining({
          destination: 'auth-server/some/random/page',
        })
      )
    })
  })

  describe("when authenticated", () => {
    beforeAll(() => {
      ;(getSession as jest.Mock).mockResolvedValue({user: mockApprover})
    })

    it("returns a list of workflows with forms as a prop", async () => {
      const response = await getServerSideProps(makeGetServerSidePropsContext({
        query: {socialCareId: mockResident.mosaicId} as ParsedUrlQuery,
      }));

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          workflows: [
            expect.objectContaining({
              id: mockWorkflowWithExtras.id,
              form: mockForm,
            }),
          ],
        })
      )
    })

    it("returns the resident as a prop", async () => {
      const response = await getServerSideProps(makeGetServerSidePropsContext({
        query: {socialCareId: mockResident.mosaicId} as ParsedUrlQuery,
      }));

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          resident: mockResident,
        })
      )
    })
  })
})
