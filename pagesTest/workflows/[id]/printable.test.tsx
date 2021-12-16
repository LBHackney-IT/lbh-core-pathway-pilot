import {GetServerSidePropsContext} from "next"
import {mockForm} from "../../../fixtures/form"
import {mockResident} from "../../../fixtures/residents"
import {mockWorkflowWithExtras} from "../../../fixtures/workflows"
import {ParsedUrlQuery} from "querystring"
import {getResidentById} from "../../../lib/residents"
import {getServerSideProps} from "../../../pages/workflows/[id]/printable"
import {getSession} from "../../../lib/auth/session"
import {mockSession} from "../../../fixtures/session";
import {makeGetServerSidePropsContext, testGetServerSidePropsAuthRedirect} from "../../../lib/auth/test-functions";

jest.mock("../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn().mockResolvedValue(mockWorkflowWithExtras),
  },
}))

jest.mock("../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("../../../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)

describe("getServerSideProps", () => {
  testGetServerSidePropsAuthRedirect(
    getServerSideProps,
    false,
    false,
    false,
  );

  it("returns the workflow and form as props", async () => {
    const response = await getServerSideProps(makeGetServerSidePropsContext({
      query: {social_care_id: mockResident.mosaicId,}
    }));

    expect(response).toHaveProperty("props", {
      workflow: expect.objectContaining({
        id: mockWorkflowWithExtras.id,
        form: mockForm,
      }),
    })
  })
})
