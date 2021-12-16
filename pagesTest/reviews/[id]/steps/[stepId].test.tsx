import { mockForm } from "../../../../fixtures/form"
import { mockResident } from "../../../../fixtures/residents"
import { mockWorkflowWithExtras } from "../../../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../../../../lib/residents"
import { getServerSideProps } from "../../../../pages/reviews/[id]/steps/[stepId]"
import { allSteps } from "../../../../config/forms"
import { getSession } from "../../../../lib/auth/session"
import {mockSession} from "../../../../fixtures/session";
import {makeGetServerSidePropsContext, testGetServerSidePropsAuthRedirect} from "../../../../lib/auth/test-functions";

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn().mockResolvedValue({
      ...mockWorkflowWithExtras,
      type: "Reassessment",
    }),
    update: jest.fn(),
  },
}))

jest.mock("../../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("../../../../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)

describe("pages/reviews/[id]/steps/[stepId].getServerSideProps", () => {
  testGetServerSidePropsAuthRedirect(
    getServerSideProps,
    false,
    false,
    false,
  );

  it("returns the workflow and form as props", async () => {
    const response = await getServerSideProps(makeGetServerSidePropsContext({
      query: {
        id: mockWorkflowWithExtras.id,
        stepId: mockForm.themes[0].steps[0].id,
      },
    }));

    expect(response).toHaveProperty("props", {
      workflow: expect.objectContaining({
        id: mockWorkflowWithExtras.id,
        form: mockForm,
      }),
      allSteps: await allSteps(),
    })
  })
})
