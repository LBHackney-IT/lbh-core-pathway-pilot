import {mockResident} from "../../../../fixtures/residents"
import {
  mockWorkflow,
  mockSubmittedWorkflowWithExtras,
  mockManagerApprovedWorkflowWithExtras,
} from "../../../../fixtures/workflows"
import {ParsedUrlQuery} from "querystring"
import {getResidentById} from "../../../../lib/residents"
import {mockForm} from "../../../../fixtures/form"
import {act, render, screen} from "@testing-library/react"
import TaskListPage, {
  getServerSideProps,
} from "../../../../pages/workflows/[id]/steps"
import {getSession} from "../../../../lib/auth/session";
import prisma from "../../../../lib/prisma"
import Layout from "../../../../components/_Layout"
import {beforeEach} from "@jest/globals";
import {mockSession, mockSessionApprover, mockSessionPanelApprover} from "../../../../fixtures/session";
import {makeGetServerSidePropsContext, testGetServerSidePropsAuthRedirect} from "../../../../lib/auth/test-functions";
import {mockPanelApprover} from "../../../../fixtures/users";

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn(),
  },
}))

jest.mock("../../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("../../../../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)

jest.mock("../../../../components/_Layout")
;(Layout as jest.Mock).mockImplementation(({children}) => <>{children}</>)

describe("<TaskListPage/>", () => {
  describe("when a workflow is submitted", () => {
    beforeEach(async () => {
      await act(async () => {
        await render(<TaskListPage workflow={mockSubmittedWorkflowWithExtras}/>)
      })
    });

    it("displays it is submitted", () => {
      expect(
        screen.getByRole("heading", {level: 2, name: "Submitted"})
      ).toBeVisible()
      expect(
        screen.getByText("This workflow has been submitted for approval.", {
          exact: false,
        })
      ).toBeVisible()
    })

    it("displays a link to return to the overview page", () => {
      expect(screen.getByText("Return to overview")).toHaveAttribute(
        "href",
        `/workflows/${mockSubmittedWorkflowWithExtras.id}`
      )
    })
  })

  describe("when a workflow is manager approved", () => {
    it("displays it is approved", () => {
      render(<TaskListPage workflow={mockManagerApprovedWorkflowWithExtras}/>)

      expect(
        screen.getByRole("heading", {level: 2, name: "Approved"})
      ).toBeVisible()
      expect(
        screen.getByText("This workflow has been approved.", {exact: false})
      ).toBeVisible()
    })

    it("displays a link to return to the overview page", () => {
      render(<TaskListPage workflow={mockManagerApprovedWorkflowWithExtras}/>)

      expect(screen.getByText("Return to overview")).toHaveAttribute(
        "href",
        `/workflows/${mockManagerApprovedWorkflowWithExtras.id}`
      )
    })
  })
})

describe("pages/workflows/[id]/steps.getServerSideProps", () => {
  it("returns the workflow and form as props", async () => {
    ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)

    const response = await getServerSideProps(makeGetServerSidePropsContext({
      query: {
        id: mockWorkflow.id,
      } as ParsedUrlQuery,
      referer: "http://example.com"
    }));

    expect(response).toHaveProperty("props", {
      workflow: expect.objectContaining({
        id: mockWorkflow.id,
        form: mockForm,
      }),
    })
  })

  testGetServerSidePropsAuthRedirect(
    getServerSideProps,
    true,
    false,
    false,
  );

  describe("when a workflow is in-progress", () => {
    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)
    })

    it("doesn't redirect", async () => {
      const response = await getServerSideProps(makeGetServerSidePropsContext({
        query: {id: mockWorkflow.id}
      }));

      expect(response).toHaveProperty("props", {
        workflow: expect.objectContaining({
          id: mockWorkflow.id,
        }),
      })
    })
  })

  describe("when a workflow is submitted", () => {
    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockSubmittedWorkflowWithExtras
      )
    })

    it("redirects back the overview page if user is not an approver", async () => {
      const response = await getServerSideProps(makeGetServerSidePropsContext({
        query: {id: mockSubmittedWorkflowWithExtras.id}
      }));

      expect(response).toHaveProperty("redirect", {
        destination: `/workflows/${mockSubmittedWorkflowWithExtras.id}`,
      })
    })

    it("doesn't redirect if user is an approver", async () => {
      ;(getSession as jest.Mock).mockResolvedValueOnce(mockSessionApprover)

      const response = await getServerSideProps(makeGetServerSidePropsContext({
        query: {id: mockSubmittedWorkflowWithExtras.id}
      }));

      expect(response).toHaveProperty("props", {
        workflow: expect.objectContaining({
          id: mockSubmittedWorkflowWithExtras.id,
        }),
      })
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
        query: {id: mockManagerApprovedWorkflowWithExtras.id}
      }));

      expect(response).toHaveProperty("redirect", {
        destination: `/workflows/${mockManagerApprovedWorkflowWithExtras.id}`,
      })
    })

    it("doesn't redirect if user is a panel approver", async () => {
      ;(getSession as jest.Mock).mockResolvedValueOnce(mockSessionPanelApprover)
      const response = await getServerSideProps(makeGetServerSidePropsContext({
        query: {id: mockManagerApprovedWorkflowWithExtras.id}
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
