import {GetServerSidePropsContext} from "next"
import { mockForm } from "../fixtures/form"
import { mockResident } from "../fixtures/residents"
import { mockWorkflowWithExtras } from "../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../lib/residents"
import { getServerSideProps } from "../pages"
import {getSession} from "next-auth/client";
import {mockApprover} from "../fixtures/users";

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
  describe('when not authenticated', () => {

    beforeAll(() => {
      ;(getSession as jest.Mock).mockResolvedValue(null)
    })

    it("returns a redirect to the sign-in page", async () => {
      const response = await getServerSideProps({
        query: {}
      } as GetServerSidePropsContext)

      expect(response).toHaveProperty(
        "redirect",
        expect.objectContaining({
          destination: "/sign-in",
        })
      )
    })
  });

  describe('when authenticated', () => {
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
            "All": 10,
            "Work assigned to me": 10,
            "Team": 10,
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
  });
})
