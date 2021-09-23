import { GetServerSidePropsContext } from "next"
import { mockForm } from "../fixtures/form"
import { mockResident } from "../fixtures/residents"
import { mockUser, mockApprover } from "../fixtures/users"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { useRouter } from "next/router"
import { getSession } from "next-auth/client"
import prisma from "../lib/prisma"
import useResident from "../hooks/useResident"
import useUsers from "../hooks/useUsers"
import { getServerSideProps } from "../pages/discarded"

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

jest.mock("next-auth/client")

jest.mock("../hooks/useResident")
;(useResident as jest.Mock).mockReturnValue({ data: mockResident })

jest.mock("../lib/prisma", () => ({
  workflow: {
    findMany: jest.fn().mockResolvedValue([mockWorkflowWithExtras]),
    update: jest.fn(),
  },
}))

global.fetch = jest.fn().mockResolvedValue({ json: jest.fn() })

describe("getServerSideProps", () => {
  beforeEach(() => {
    ;(prisma.workflow.findMany as jest.Mock).mockClear()
    ;(getSession as jest.Mock).mockClear()
    ;(getSession as jest.Mock).mockResolvedValue({ user: mockApprover })
  })

  it("redirects to root if current user isn't an approver", async () => {
    ;(getSession as jest.Mock).mockResolvedValue({ user: mockUser })

    const response = await getServerSideProps({
      query: { id: mockWorkflowWithExtras.id } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty("redirect", { destination: "/" })
  })

  it("searches for workflows that aren't discarded", async () => {
    await getServerSideProps({
      query: { id: mockWorkflowWithExtras.id } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(prisma.workflow.findMany).toBeCalledWith(
      expect.objectContaining({
        where: { discardedAt: { not: null } },
      })
    )
  })

  it("includes the creator of a workflow", async () => {
    await getServerSideProps({
      query: { id: mockWorkflowWithExtras.id } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(prisma.workflow.findMany).toBeCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({ creator: true }),
      })
    )
  })

  it("includes the assignee of a workflow", async () => {
    await getServerSideProps({
      query: { id: mockWorkflowWithExtras.id } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(prisma.workflow.findMany).toBeCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({ assignee: true }),
      })
    )
  })

  it("includes the next review of a workflow", async () => {
    await getServerSideProps({
      query: { id: mockWorkflowWithExtras.id } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(prisma.workflow.findMany).toBeCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({ nextReview: true }),
      })
    )
  })

  it("returns the workflow and form as props", async () => {
    const response = await getServerSideProps({
      query: { id: mockWorkflowWithExtras.id } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

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
