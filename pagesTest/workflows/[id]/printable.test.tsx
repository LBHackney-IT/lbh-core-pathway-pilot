import { mockForm } from "../../../fixtures/form"
import { mockResident } from "../../../fixtures/residents"
import { mockWorkflowWithExtras } from "../../../fixtures/workflows"
import { getResidentById } from "../../../lib/residents"
import { getServerSideProps } from "../../../pages/workflows/[id]/printable"
import { getSession } from "../../../lib/auth/session"
import {
  mockSession,
  mockSessionNotInPilot,
  mockSessionPanelApprover,
  mockSessionApprover,
} from "../../../fixtures/session"
import {
  makeGetServerSidePropsContext,
  testGetServerSidePropsAuthRedirect,
} from "../../../lib/auth/test-functions"

jest.mock("../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn().mockResolvedValue(mockWorkflowWithExtras),
  },
}))

jest.mock("../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("../../../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)

describe("getServerSideProps", () => {
  const context = makeGetServerSidePropsContext({
    query: { social_care_id: mockResident.mosaicId },
  })

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

  it("returns the workflow and form as props", async () => {
    const response = await getServerSideProps(context)

    expect(response).toHaveProperty("props", {
      workflow: expect.objectContaining({
        id: mockWorkflowWithExtras.id,
        form: mockForm,
      }),
    })
  })
})
