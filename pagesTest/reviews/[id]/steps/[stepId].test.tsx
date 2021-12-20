import { mockForm } from "../../../../fixtures/form"
import { mockResident } from "../../../../fixtures/residents"
import { mockWorkflowWithExtras } from "../../../../fixtures/workflows"
import { getResidentById } from "../../../../lib/residents"
import { getServerSideProps } from "../../../../pages/reviews/[id]/steps/[stepId]"
import { allSteps } from "../../../../config/forms"
import { getSession } from "../../../../lib/auth/session"
import {
  mockSession,
  mockSessionNotInPilot,
  mockSessionPanelApprover,
  mockSessionApprover,
} from "../../../../fixtures/session"
import {
  makeGetServerSidePropsContext,
  testGetServerSidePropsAuthRedirect,
} from "../../../../lib/auth/test-functions"
import { mockApprover, mockUser } from "../../../../fixtures/users"
import prisma from "../../../../lib/prisma"

const mockReassessment = {
  ...mockWorkflowWithExtras,
  type: "Reassessment",
}

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn().mockResolvedValue({
      ...mockWorkflowWithExtras,
      type: "Reassessment",
    }),
    update: jest.fn(),
  },
}))

jest.mock("../../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("../../../../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)

describe("pages/reviews/[id]/steps/[stepId].getServerSideProps", () => {
  const context = makeGetServerSidePropsContext({
    query: {
      id: mockWorkflowWithExtras.id,
      stepId: mockForm.themes[0].steps[0].id,
    },
  })

  describe("when a workflow is in-progress", function () {
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
      ;(getSession as jest.Mock).mockResolvedValue(mockSession)

      const response = await getServerSideProps(context)

      expect(response).toHaveProperty("props", {
        workflow: expect.objectContaining({
          id: mockWorkflowWithExtras.id,
          form: mockForm,
        }),
        allSteps: await allSteps(),
      })
    })
  })

  describe("when a workflow is manager approved", () => {
    const mockApprovedReassessment = {
      ...mockReassessment,
      submittedAt: new Date(),
      submittedBy: mockUser.email,
      managerApprovedAt: new Date(),
      managerApprovedBy: mockApprover.email,
    }

    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockApprovedReassessment
      )
    })

    testGetServerSidePropsAuthRedirect({
      getServerSideProps,
      tests: [
        {
          name: "user is not in pilot group",
          session: mockSessionNotInPilot,
          redirect: "/workflows/123abc",
          context,
        },
        {
          name: "user is only an approver",
          session: mockSessionApprover,
          redirect: "/workflows/123abc",
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
      ;(getSession as jest.Mock).mockResolvedValue(mockSessionPanelApprover)

      const response = await getServerSideProps(context)

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          workflow: expect.objectContaining({
            id: mockApprovedReassessment.id,
          }),
        })
      )
    })
  })
})
