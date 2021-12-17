import {mockForm} from "../../../fixtures/form"
import {mockResident} from "../../../fixtures/residents"
import {mockWorkflowWithExtras} from "../../../fixtures/workflows"
import {ParsedUrlQuery} from "querystring"
import {getResidentById} from "../../../lib/residents"
import {getServerSideProps} from "../../../pages/workflows/[id]/finish"
import {getSession} from "../../../lib/auth/session";
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


describe("page/workflows/[id]/finish.getServerSideProps", () => {
  testGetServerSidePropsAuthRedirect(
    getServerSideProps,
    true,
    false,
    false,
  );

  it("returns the workflow and form as props", async () => {
    const response = await getServerSideProps(makeGetServerSidePropsContext({
      query: {
        id: mockWorkflowWithExtras.id,
      } as ParsedUrlQuery,
      referer: "http://example.com",
    }))

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({
        id: mockWorkflowWithExtras.id,
        form: mockForm,
      })
    )
  })
})
