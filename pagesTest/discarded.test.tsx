import { mockForm } from "../fixtures/form"
import { mockResident } from "../fixtures/residents"
import { mockUser } from "../fixtures/users"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { useRouter } from "next/router"
import { getSession } from "../lib/auth/session"
import prisma from "../lib/prisma"
import useResident from "../hooks/useResident"
import useUsers from "../hooks/useUsers"
import { getServerSideProps } from "../pages/discarded"
import {
  mockSession,
  mockSessionNotInPilot,
  mockSessionPanelApprover,
  mockSessionApprover,
} from "../fixtures/session"
import {
  makeGetServerSidePropsContext,
  testGetServerSidePropsAuthRedirect,
} from "../lib/auth/test-functions"

const useRouterReplace = jest.fn()

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  replace: useRouterReplace,
  query: { revisionId: mockWorkflowWithExtras.revisions[0].id },
})

jest.mock("../hooks/useUsers")
;(useUsers as jest.Mock).mockReturnValue({
  data: [mockUser],
})

jest.mock("../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue({ ...mockSession, approver: true })

jest.mock("../hooks/useResident")
;(useResident as jest.Mock).mockReturnValue({ data: mockResident })

jest.mock("../lib/prisma", () => ({
  workflow: {
    findMany: jest.fn().mockResolvedValue([mockWorkflowWithExtras]),
    update: jest.fn(),
  },
}))

global.fetch = jest.fn().mockResolvedValue({ json: jest.fn() })

describe("pages/discarded.getServerSideProps", () => {
  const context = makeGetServerSidePropsContext({
    query: { id: mockWorkflowWithExtras.id },
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
        redirect: true,
        context,
      },
    ],
  })

  it("searches for workflows that aren't discarded", async () => {
    await getServerSideProps(
      makeGetServerSidePropsContext({
        query: { id: mockWorkflowWithExtras.id } as ParsedUrlQuery,
      })
    )

    expect(prisma.workflow.findMany).toBeCalledWith(
      expect.objectContaining({
        where: { discardedAt: { not: null } },
      })
    )
  })

  it("includes the creator of a workflow", async () => {
    await getServerSideProps(
      makeGetServerSidePropsContext({
        query: { id: mockWorkflowWithExtras.id } as ParsedUrlQuery,
      })
    )

    expect(prisma.workflow.findMany).toBeCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({ creator: true }),
      })
    )
  })

  it("includes the assignee of a workflow", async () => {
    await getServerSideProps(
      makeGetServerSidePropsContext({
        query: { id: mockWorkflowWithExtras.id } as ParsedUrlQuery,
      })
    )

    expect(prisma.workflow.findMany).toBeCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({ assignee: true }),
      })
    )
  })

  it("includes the next review of a workflow", async () => {
    await getServerSideProps(
      makeGetServerSidePropsContext({
        query: { id: mockWorkflowWithExtras.id } as ParsedUrlQuery,
      })
    )

    expect(prisma.workflow.findMany).toBeCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({ nextReview: true }),
      })
    )
  })

  it("returns the workflow and form as props", async () => {
    const response = await getServerSideProps(
      makeGetServerSidePropsContext({
        query: { id: mockWorkflowWithExtras.id } as ParsedUrlQuery,
      })
    )

    expect(response).toHaveProperty("props", {
      workflows: [
        expect.objectContaining({
          id: mockWorkflowWithExtras.id,
          form: mockForm,
        }),
      ],
    })
  })
})
