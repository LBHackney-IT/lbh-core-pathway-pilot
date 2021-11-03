import { GetServerSidePropsContext } from "next"
import { mockForm } from "../fixtures/form"
import { mockResident } from "../fixtures/residents"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../lib/residents"
import { getServerSideProps } from "../pages"
import { getSession } from "next-auth/client"
import { mockApprover } from "../fixtures/users"
import prisma from "../lib/prisma"
import { WorkflowType } from "@prisma/client"

jest.mock("../lib/prisma", () => ({
  workflow: {
    findMany: jest.fn().mockResolvedValue([mockWorkflowWithExtras]),
    update: jest.fn(),
    count: jest.fn().mockReturnValue(10),
  },
}))

jest.mock("../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("next-auth/client")

describe("getServerSideProps", () => {
  describe("when not authenticated", () => {
    beforeAll(() => {
      ;(getSession as jest.Mock).mockResolvedValue(null)
    })

    it("returns a redirect to the sign-in page", async () => {
      const response = await getServerSideProps({
        query: {},
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty(
        "redirect",
        expect.objectContaining({
          destination: "/sign-in",
        })
      )
    })
  })

  describe("when authenticated", () => {
    beforeAll(() => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: mockApprover })
    })

    it("returns the workflow and form as props", async () => {
      const response = await getServerSideProps({
        query: { social_care_id: mockResident.mosaicId } as ParsedUrlQuery,
      } as GetServerSidePropsContext)

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

    it("returns the workflow bucket counts as props", async () => {
      const response = await getServerSideProps({
        query: { social_care_id: mockResident.mosaicId } as ParsedUrlQuery,
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          workflowTotals: {
            All: 10,
            "Work assigned to me": 10,
            Team: 10,
          },
        })
      )
    })

    it("returns the resident as props", async () => {
      const response = await getServerSideProps({
        query: { social_care_id: mockResident.mosaicId } as ParsedUrlQuery,
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          resident: mockResident,
        })
      )
    })

    it("returns the form as props", async () => {
      const response = await getServerSideProps({
        query: { social_care_id: mockResident.mosaicId } as ParsedUrlQuery,
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          forms: [mockForm],
        })
      )
    })

    it("returns the current tab as props", async () => {
      ;(prisma.workflow.findMany as jest.Mock).mockClear()

      const response = await getServerSideProps({
        query: {
          social_care_id: mockResident.mosaicId,
          tab: "Team",
        } as ParsedUrlQuery,
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          tab: "Team",
        })
      )
    })

    it("returns the me tab as props if tab isn't set", async () => {
      ;(prisma.workflow.findMany as jest.Mock).mockClear()

      const response = await getServerSideProps({
        query: {
          social_care_id: mockResident.mosaicId,
        } as ParsedUrlQuery,
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          tab: "Work assigned to me",
        })
      )
    })

    it("returns the current page as props", async () => {
      ;(prisma.workflow.findMany as jest.Mock).mockClear()

      const response = await getServerSideProps({
        query: {
          social_care_id: mockResident.mosaicId,
          page: "1",
        } as ParsedUrlQuery,
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          currentPage: 1,
        })
      )
    })

    it("returns the page as 0 as props if current page isn't set", async () => {
      ;(prisma.workflow.findMany as jest.Mock).mockClear()

      const response = await getServerSideProps({
        query: {
          social_care_id: mockResident.mosaicId,
        } as ParsedUrlQuery,
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          currentPage: 0,
        })
      )
    })

    it("filters historic workflows if show_historic is not provided", async () => {
      ;(prisma.workflow.findMany as jest.Mock).mockClear()

      await getServerSideProps({
        query: { social_care_id: mockResident.mosaicId } as ParsedUrlQuery,
      } as GetServerSidePropsContext)

      expect(prisma.workflow.findMany).toBeCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: {
              in: [
                WorkflowType.Reassessment,
                WorkflowType.Review,
                WorkflowType.Assessment,
              ],
            },
          }),
        })
      )
    })

    it("includes historic workflows if show_historic is true", async () => {
      ;(prisma.workflow.findMany as jest.Mock).mockClear()

      await getServerSideProps({
        query: {
          social_care_id: mockResident.mosaicId,
          show_historic: "true",
        } as ParsedUrlQuery,
      } as GetServerSidePropsContext)

      expect(prisma.workflow.findMany).toBeCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: undefined,
          }),
        })
      )
    })

    it("filters historic workflows if show_historic is false", async () => {
      ;(prisma.workflow.findMany as jest.Mock).mockClear()

      await getServerSideProps({
        query: {
          social_care_id: mockResident.mosaicId,
          show_historic: "false",
        } as ParsedUrlQuery,
      } as GetServerSidePropsContext)

      expect(prisma.workflow.findMany).toBeCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: {
              in: [
                WorkflowType.Reassessment,
                WorkflowType.Review,
                WorkflowType.Assessment,
              ],
            },
          }),
        })
      )
    })

    describe("when on the team tab", () => {
      it("filters workflows based on the current user's team", async () => {
        ;(prisma.workflow.findMany as jest.Mock).mockClear()

        await getServerSideProps({
          query: {
            social_care_id: mockResident.mosaicId,
            tab: "Team",
          } as ParsedUrlQuery,
        } as GetServerSidePropsContext)

        expect(prisma.workflow.findMany).toBeCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              teamAssignedTo: expect.objectContaining({
                equals: mockApprover.team,
              }),
            }),
          })
        )
      })

      it("filters workflows without a team assigned to them", async () => {
        ;(prisma.workflow.findMany as jest.Mock).mockClear()

        await getServerSideProps({
          query: {
            social_care_id: mockResident.mosaicId,
            tab: "Team",
          } as ParsedUrlQuery,
        } as GetServerSidePropsContext)

        expect(prisma.workflow.findMany).toBeCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              teamAssignedTo: expect.objectContaining({
                not: null,
              }),
            }),
          })
        )
      })

      it("counts workflows based on the current user's team", async () => {
        ;(prisma.workflow.count as jest.Mock).mockClear()

        await getServerSideProps({
          query: {
            social_care_id: mockResident.mosaicId,
            tab: "Team",
          } as ParsedUrlQuery,
        } as GetServerSidePropsContext)

        expect(prisma.workflow.count).toBeCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              teamAssignedTo: expect.objectContaining({
                equals: mockApprover.team,
              }),
            }),
          })
        )
      })

      it("doesn't count workflows without a team assigned to them", async () => {
        ;(prisma.workflow.count as jest.Mock).mockClear()

        await getServerSideProps({
          query: {
            social_care_id: mockResident.mosaicId,
            tab: "Team",
          } as ParsedUrlQuery,
        } as GetServerSidePropsContext)

        expect(prisma.workflow.count).toBeCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              teamAssignedTo: expect.objectContaining({
                not: null,
              }),
            }),
          })
        )
      })
    })
  })
})
