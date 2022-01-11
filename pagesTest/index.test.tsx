import { mockResident } from "../fixtures/residents"
import { getResidentById } from "../lib/residents"
import { getServerSideProps } from "../pages"
import { getSession } from "../lib/auth/session"
import { mockForm } from "../fixtures/form"
import {
  makeGetServerSidePropsContext,
  testGetServerSidePropsAuthRedirect,
} from "../lib/auth/test-functions"
import {
  mockSession,
  mockSessionNotInPilot,
  mockSessionPanelApprover,
  mockSessionApprover,
} from "../fixtures/session"

jest.mock("../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)
jest.mock("../lib/auth/session")

describe("pages/index.getServerSideProps", () => {
  const context = makeGetServerSidePropsContext({})

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

  describe("when authenticated", () => {
    beforeAll(() => {
      ;(getSession as jest.Mock).mockResolvedValue(mockSession)
    })

    it("returns a list of workflows with forms as a prop", async () => {
      const response = await getServerSideProps(context)

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          forms: [mockForm],
        })
      )
    })
  })
})
