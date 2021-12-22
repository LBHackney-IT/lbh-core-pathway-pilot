import { mockForm } from "../../../fixtures/form"
import { mockResident } from "../../../fixtures/residents"
import { mockWorkflowWithExtras } from "../../../fixtures/workflows"
import { getResidentById } from "../../../lib/residents"
import { getServerSideProps } from "../../../pages/workflows/[id]/finish"
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
import prisma from "../../../lib/prisma"

jest.mock("../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn().mockResolvedValue(mockWorkflowWithExtras),
  },
}))

jest.mock("../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("../../../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)

describe("page/workflows/[id]/finish.getServerSideProps", () => {
  const context = makeGetServerSidePropsContext({
    query: {
      id: mockWorkflowWithExtras.id,
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

  it("returns the workflow and form as props", async () => {
    const response = await getServerSideProps(context)

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({
        id: mockWorkflowWithExtras.id,
        form: mockForm,
      })
    )
  })

  it("calls Prisma to find workflow and include next steps", async () => {
    await getServerSideProps(context)

    expect(prisma.workflow.findUnique).toBeCalledWith(
      expect.objectContaining({
        where: {
          id: mockWorkflowWithExtras.id,
        },
        include: {
          nextSteps: true,
        },
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
            id: mockWorkflowWithExtras.id,
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

  describe("when a workflow is submitted", () => {
    let response

    beforeAll(async () => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue({
        ...mockWorkflowWithExtras,
        submittedAt: new Date(),
      })

      response = await getServerSideProps(
        makeGetServerSidePropsContext({
          query: {
            id: mockWorkflowWithExtras.id,
          },
        })
      )
    })

    it("returns a redirect to overview page for the workflow", () => {
      expect(response).toHaveProperty(
        "redirect",
        expect.objectContaining({
          destination: "/workflows/123abc",
        })
      )
    })
  })
})
