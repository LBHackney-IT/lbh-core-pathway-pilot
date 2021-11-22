import { GetServerSidePropsContext } from "next"
import { mockResident } from "../fixtures/residents"
import { getResidentById } from "../lib/residents"
import { getServerSideProps } from "../pages"
import { getSession } from "next-auth/client"
import { mockApprover } from "../fixtures/users"
import { mockForm } from "../fixtures/form"

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

    it("returns a redirect to the sign-in page that will redirect to another on login", async () => {
      const response = await getServerSideProps({
        query: {},
        resolvedUrl: "/some/random/page",
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty(
        "redirect",
        expect.objectContaining({
          destination: `/sign-in?page=/some/random/page`,
        })
      )
    })
  })

  describe("when authenticated", () => {
    beforeAll(() => {
      ;(getSession as jest.Mock).mockResolvedValue({ user: mockApprover })
    })

    it("returns a list of workflows with forms as a prop", async () => {
      const response = await getServerSideProps({} as GetServerSidePropsContext)

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          forms: [mockForm],
        })
      )
    })
  })
})
