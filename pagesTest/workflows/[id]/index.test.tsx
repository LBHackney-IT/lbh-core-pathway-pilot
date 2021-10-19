import { GetServerSidePropsContext } from "next"
import { mockForm } from "../../../fixtures/form"
import { mockResident } from "../../../fixtures/residents"
import { mockWorkflowWithExtras } from "../../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../../../lib/residents"
import { getServerSideProps } from "../../../pages/workflows/[id]"
import {getSession} from "next-auth/client";
import {mockUser} from "../../../fixtures/users";

jest.mock("../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn().mockResolvedValue(mockWorkflowWithExtras),
  },
}))

jest.mock("../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("next-auth/client")
;(getSession as jest.Mock).mockResolvedValue({ user: mockUser })


describe("getServerSideProps", () => {
  it("returns the workflow and form as props", async () => {
    const response = await getServerSideProps({
      query: {
        social_care_id: mockResident.mosaicId,
      } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({
        id: mockWorkflowWithExtras.id,
        form: mockForm,
      })
    )
  })
})
