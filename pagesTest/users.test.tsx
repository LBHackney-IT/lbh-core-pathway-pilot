import { GetServerSidePropsContext } from "next"
import { getServerSideProps } from "../pages/users"
import { getSession } from "next-auth/client"
import { mockApprover, mockUser } from "../fixtures/users"
import prisma from "../lib/prisma"

jest.mock("../lib/prisma", () => ({
  user: {
    findMany: jest.fn(),
  },
}))

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
    beforeEach(() => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: mockApprover })
      ;(prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser])
    })

    it("redirects if current user is not an approver", async () => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: mockUser })

      const response = await getServerSideProps({} as GetServerSidePropsContext)

      expect(response).toStrictEqual({
        props: {},
        redirect: {
          destination: "/",
        },
      })
    })

    it("filters historic users", async () => {
      await getServerSideProps({} as GetServerSidePropsContext)

      expect(prisma.user.findMany).toBeCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            historic: false,
          }),
        })
      )
    })

    it("orders users by team and then approvers", async () => {
      await getServerSideProps({} as GetServerSidePropsContext)

      expect(prisma.user.findMany).toBeCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([
            { team: "asc" },
            { panelApprover: "desc" },
            { approver: "desc" },
            { name: "asc" },
          ]),
        })
      )
    })

    it("includes the latest session for each user", async () => {
      await getServerSideProps({} as GetServerSidePropsContext)

      expect(prisma.user.findMany).toBeCalledWith(
        expect.objectContaining({
          include: {
            sessions: {
              select: {
                updatedAt: true,
              },
              take: 1,
              orderBy: {
                updatedAt: "desc",
              },
            },
          },
        })
      )
    })
  })
})
