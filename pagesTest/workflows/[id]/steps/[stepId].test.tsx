import { allSteps } from "../../../../config/forms"
import { mockResident } from "../../../../fixtures/residents"
import {
  mockWorkflow,
  mockSubmittedWorkflowWithExtras,
  mockManagerApprovedWorkflowWithExtras,
  mockWorkflowWithExtras,
} from "../../../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../../../../lib/residents"
import { mockForm } from "../../../../fixtures/form"
import { getServerSideProps } from "../../../../pages/workflows/[id]/steps/[stepId]"
import prisma from "../../../../lib/prisma"
import { getLoginUrl, getSession } from "../../../../lib/auth/session"
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

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn(),
  },
}))

jest.mock("../../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("../../../../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)
;(getLoginUrl as jest.Mock).mockImplementation(
  (url = "") => `auth-server${url}`
)

describe("pages/workflows/[id]/steps/[stepId].getServerSideProps", () => {
  ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)

  it("returns the workflow and all steps for forms as props", async () => {
    const response = await getServerSideProps(
      makeGetServerSidePropsContext({
        query: {
          id: mockWorkflow.id,
          stepId: mockForm.themes[0].steps[0].id,
        } as ParsedUrlQuery,
      })
    )

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({
        workflow: mockWorkflow,
        allSteps: await allSteps(),
      })
    )
  })

  describe("when a workflow doesn't exist", () => {
    let response

    beforeAll(async () => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(null)

      response = await getServerSideProps(
        makeGetServerSidePropsContext({
          query: {
            id: mockWorkflow.id,
            stepId: mockForm.themes[0].steps[0].id,
          },
        })
      )
    })

    it("returns a redirect to /404", () => {
      expect(response).toHaveProperty(
        "redirect",
        expect.objectContaining({
          destination: "/404",
        })
      )
    })
  })

  describe("when a workflow is in-progress", () => {
    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)
    })

    const context = makeGetServerSidePropsContext({
      query: {
        id: mockWorkflow.id,
        stepId: mockForm.themes[0].steps[0].id,
      },
    })

    testGetServerSidePropsAuthRedirect({
      getServerSideProps,
      tests: [
        {
          name: "user is not in pilot group",
          session: mockSessionNotInPilot,
          redirect: true,
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
  })

  describe("when a workflow is submitted", () => {
    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockSubmittedWorkflowWithExtras
      )
    })

    const context = makeGetServerSidePropsContext({
      query: {
        id: mockSubmittedWorkflowWithExtras.id,
        stepId: mockForm.themes[0].steps[0].id,
      },
    })

    testGetServerSidePropsAuthRedirect({
      getServerSideProps,
      tests: [
        {
          name: "user is not in pilot group",
          session: mockSessionNotInPilot,
          redirect: true,
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
          redirect: "/workflows/123abc",
          context,
        },
      ],
    })
  })

  describe("when a workflow is manager approved", () => {
    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockManagerApprovedWorkflowWithExtras
      )
    })

    const context = makeGetServerSidePropsContext({
      query: {
        id: mockManagerApprovedWorkflowWithExtras.id,
        stepId: mockForm.themes[0].steps[0].id,
      },
    })

    testGetServerSidePropsAuthRedirect({
      getServerSideProps,
      tests: [
        {
          name: "user is not in pilot group",
          session: mockSessionNotInPilot,
          redirect: true,
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
  })

  describe("when a workflow is a reassessment", () => {
    let response

    beforeAll(async () => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockWorkflowWithExtras
      )

      response = await getServerSideProps(
        makeGetServerSidePropsContext({
          query: {
            id: mockWorkflowWithExtras.id,
            stepId: mockForm.themes[0].steps[0].id,
          },
        })
      )
    })

    it("returns a redirect to the step page for a reassessment", () => {
      expect(response).toHaveProperty(
        "redirect",
        expect.objectContaining({
          destination: `/reviews/123abc/steps/${mockForm.themes[0].steps[0].id}`,
          statusCode: 307,
        })
      )
    })
  })
})
