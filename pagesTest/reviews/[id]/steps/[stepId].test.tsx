import { GetServerSidePropsContext } from "next"
import { mockForm } from "../../../../fixtures/form"
import { mockResident } from "../../../../fixtures/residents"
import { mockWorkflowWithExtras } from "../../../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../../../../lib/residents"
import { getServerSideProps } from "../../../../pages/reviews/[id]/steps/[stepId]"
import { allSteps } from "../../../../config/forms"
import {getSession} from "next-auth/client";
import {mockUser} from "../../../../fixtures/users";

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn().mockResolvedValue(mockWorkflowWithExtras),
    update: jest.fn(),
  },
}))

jest.mock("../../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("next-auth/client")
;(getSession as jest.Mock).mockResolvedValue({ user: mockUser })

describe("getServerSideProps", () => {
  it("returns the workflow and form as props", async () => {
    const response = await getServerSideProps({
      query: {
        id: mockWorkflowWithExtras.id,
        stepId: mockForm.themes[0].steps[0].id,
      } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty("props", {
      workflow: expect.objectContaining({
        id: mockWorkflowWithExtras.id,
        form: mockForm,
      }),
      allSteps: await allSteps(),
    })
  })
})
