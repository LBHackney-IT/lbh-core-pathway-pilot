import {allSteps} from "../../../../config/forms"
import {mockResident} from "../../../../fixtures/residents"
import {
  mockWorkflow,
  mockSubmittedWorkflowWithExtras,
  mockManagerApprovedWorkflowWithExtras,
} from "../../../../fixtures/workflows"
import {ParsedUrlQuery} from "querystring"
import {getResidentById} from "../../../../lib/residents"
import {mockForm} from "../../../../fixtures/form"
import {getServerSideProps} from "../../../../pages/workflows/[id]/steps/[stepId]"
import prisma from "../../../../lib/prisma"
import {getLoginUrl, getSession} from "../../../../lib/auth/session";
import {mockSession} from "../../../../fixtures/session";
import {makeGetServerSidePropsContext, testGetServerSidePropsAuthRedirect} from "../../../../lib/auth/test-functions";

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn(),
  },
}))

jest.mock("../../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("../../../../lib/auth/session");
(getSession as jest.Mock).mockResolvedValue(mockSession);
(getLoginUrl as jest.Mock).mockImplementation((url = '') => `auth-server${url}`);

describe("pages/workflows/[id]/steps/[stepId].getServerSideProps", () => {
  ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)

  testGetServerSidePropsAuthRedirect(
    getServerSideProps,
    true,
    false,
    false,
  );

  it("returns the workflow and all steps for forms as props", async () => {
    const response = await getServerSideProps(makeGetServerSidePropsContext({
      query: {
        id: mockWorkflow.id,
        stepId: mockForm.themes[0].steps[0].id,
      } as ParsedUrlQuery,
    }))

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({
        workflow: mockWorkflow,
        allSteps: await allSteps(),
      })
    )
  })

  describe("when a workflow is in-progress", () => {
    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)
    })

    it("doesn't redirect", async () => {
      const response = await getServerSideProps(makeGetServerSidePropsContext({
        query: {id: mockWorkflow.id} as ParsedUrlQuery,
      }));

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          workflow: expect.objectContaining({
            id: mockWorkflow.id,
          }),
        })
      )
    })
  })

  describe("when a workflow is submitted", () => {
    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockSubmittedWorkflowWithExtras
      )
    })

    it("redirects back the overview page if user is not an approver", async () => {
      ;(getSession as jest.Mock).mockResolvedValueOnce(mockSession);

      const response = await getServerSideProps(makeGetServerSidePropsContext({
        query: {
          id: mockSubmittedWorkflowWithExtras.id,
        } as ParsedUrlQuery,
      }));

      expect(response).toHaveProperty("redirect", {
        destination: `/workflows/${mockSubmittedWorkflowWithExtras.id}`,
      })
    })

    it("doesn't redirect if user is an approver", async () => {
      ;(getSession as jest.Mock).mockResolvedValueOnce({
        ...mockSession,
        approver: true,
      })

      const response = await getServerSideProps(makeGetServerSidePropsContext({
        query: {
          id: mockSubmittedWorkflowWithExtras.id,
        } as ParsedUrlQuery
      }));

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          workflow: expect.objectContaining({
            id: mockSubmittedWorkflowWithExtras.id,
          }),
        })
      )
    })
  })

  describe("when a workflow is manager approved", () => {
    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockManagerApprovedWorkflowWithExtras
      )
    })

    it("redirects back the overview page if user is not a panel approver", async () => {
      const response = await getServerSideProps(makeGetServerSidePropsContext({
        query: {
          id: mockManagerApprovedWorkflowWithExtras.id,
        } as ParsedUrlQuery,
      }));

      expect(response).toHaveProperty("redirect", {
        destination: `/workflows/${mockManagerApprovedWorkflowWithExtras.id}`,
      })
    })

    it("doesn't redirect if user is a panel approver", async () => {
      ;(getSession as jest.Mock).mockResolvedValueOnce({
        ...mockSession,
        panelApprover: true,
      })

      const response = await getServerSideProps(makeGetServerSidePropsContext({
        query: {
          id: mockManagerApprovedWorkflowWithExtras.id,
        }
      }));

      expect(response).toHaveProperty(
        "props",
        expect.objectContaining({
          workflow: expect.objectContaining({
            id: mockManagerApprovedWorkflowWithExtras.id,
          }),
        })
      )
    })
  })
})
