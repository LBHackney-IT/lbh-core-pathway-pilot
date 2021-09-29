import { GetServerSidePropsContext } from "next"
import { mockResident } from "../../../fixtures/residents"
import { mockWorkflowWithExtras } from "../../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../../../lib/residents"
import prisma from "../../../lib/prisma"
import { getServerSideProps } from "../../../pages/workflows/[id]/confirm-personal-details"

jest.mock("../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}))

jest.mock("../../../lib/residents")

describe("getServerSideProps", () => {
  beforeEach(() => {
    ;(prisma.workflow.findUnique as jest.Mock).mockClear()
    ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
      mockWorkflowWithExtras
    )
    ;(getResidentById as jest.Mock).mockClear()
    ;(getResidentById as jest.Mock).mockResolvedValue(mockResident)
  })

  it("returns 404 if workflow doesn't exist", async () => {
    ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(null)

    const response = await getServerSideProps({
      query: { id: mockWorkflowWithExtras.id } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty("redirect", { destination: "/404" })
  })

  it("returns 404 if resident doesn't exist", async () => {
    ;(getResidentById as jest.Mock).mockResolvedValue(null)

    const response = await getServerSideProps({
      query: { id: mockWorkflowWithExtras.id } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty("redirect", { destination: "/404" })
  })

  it("returns the resident as props", async () => {
    const response = await getServerSideProps({
      query: { id: mockWorkflowWithExtras.id } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining(mockResident)
    )
  })
})
