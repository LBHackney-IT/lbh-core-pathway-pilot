import { GetServerSidePropsContext } from "next"
import { allSteps } from "../../../../config/forms"
import { mockResident } from "../../../../fixtures/residents"
import { mockWorkflow } from "../../../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../../../../lib/residents"
import { mockForm } from "../../../../fixtures/form"
import { getServerSideProps } from "../../../../pages/workflows/[id]/steps/[stepId]"

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn().mockResolvedValue(mockWorkflow),
  },
}))

jest.mock("../../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

describe("getServerSideProps", () => {
  it("returns the workflow and all steps for forms as props", async () => {
    const response = await getServerSideProps({
      query: {
        id: mockWorkflow.id,
        stepId: mockForm.themes[0].steps[0].id,
      } as ParsedUrlQuery,
    } as GetServerSidePropsContext)

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({
        workflow: mockWorkflow,
        allSteps: allSteps,
      })
    )
  })
})
