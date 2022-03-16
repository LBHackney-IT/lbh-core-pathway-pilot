import { mockResident } from "../../../../fixtures/residents"
import {
  mockWorkflow,
  mockSubmittedWorkflowWithExtras,
  mockManagerApprovedWorkflowWithExtras,
  mockWorkflowWithExtras,
} from "../../../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { getResidentById } from "../../../../lib/residents"
import { mockForm } from "../../../../fixtures/form"
import { act, render, screen } from "@testing-library/react"
import TaskListPage, {
  getServerSideProps,
} from "../../../../pages/workflows/[id]/steps"
import { getSession } from "../../../../lib/auth/session"
import prisma from "../../../../lib/prisma"
import Layout from "../../../../components/_Layout"
import { beforeEach } from "@jest/globals"
import {
  mockSession,
  mockSessionNotInPilot,
  mockSessionApprover,
  mockSessionPanelApprover,
} from "../../../../fixtures/session"
import {
  makeGetServerSidePropsContext,
  testGetServerSidePropsAuthRedirect,
} from "../../../../lib/auth/test-functions"

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
;(Layout as jest.Mock).mockImplementation(({ children }) => <>{children}</>)

describe("<TaskListPage/>", () => {
  describe("when a workflow is submitted", () => {
    beforeEach(async () => {
      await act(async () => {
        await render(
          <TaskListPage workflow={mockSubmittedWorkflowWithExtras} />
        )
      })
    })

    it("displays it is submitted", () => {
      expect(
        screen.getByRole("heading", { level: 2, name: "Submitted" })
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
      render(<TaskListPage workflow={mockManagerApprovedWorkflowWithExtras} />)

      expect(
        screen.getByRole("heading", { level: 2, name: "Approved" })
      ).toBeVisible()
      expect(
        screen.getByText("This workflow has been approved.", { exact: false })
      ).toBeVisible()
    })

    it("displays a link to return to the overview page", () => {
      render(<TaskListPage workflow={mockManagerApprovedWorkflowWithExtras} />)

      expect(screen.getByText("Return to overview")).toHaveAttribute(
        "href",
        `/workflows/${mockManagerApprovedWorkflowWithExtras.id}`
      )
    })
  })
  describe("when a workflow is in progress", () => {
    it("displays the correct number of steps to complete", () => {
      render(<TaskListPage workflow={mockWorkflowWithExtras} />)
      const expectedStepNumber = 4;
      expect(
        screen.getByText(`of ${expectedStepNumber} steps. Your changes will be saved automatically.`, { exact: false })
      ).toBeVisible()
    })
  })
})

describe("pages/workflows/[id]/steps.getServerSideProps", () => {
  it("returns the workflow and form as props", async () => {
    ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)

    const response = await getServerSideProps(
      makeGetServerSidePropsContext({
        query: {
          id: mockWorkflow.id,
        } as ParsedUrlQuery,
        referer: "http://example.com",
      })
    )

    expect(response).toHaveProperty("props", {
      workflow: expect.objectContaining({
        id: mockWorkflow.id,
        form: mockForm,
      }),
    })
  })

  describe("when a workflow is in-progress", () => {
    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)
    })

    const context = makeGetServerSidePropsContext({
      query: {
        id: mockWorkflow.id,
        stepId: mockForm.themes[0].steps[0].id,
      },
    })

    testGetServerSidePropsAuthRedirect({
      getServerSideProps,
      tests: [
        {
          name: "user is not in pilot group",
          session: mockSessionNotInPilot,
          redirect: true,
          context,
        },
        {
          name: "user is only an approver",
          session: mockSessionApprover,
          context,
        },
        {
          name: "user is only a panel approver",
          session: mockSessionPanelApprover,
          context,
        },
      ],
    })
  })

  describe("when a workflow is submitted", () => {
    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockSubmittedWorkflowWithExtras
      )
    })

    const context = makeGetServerSidePropsContext({
      query: {
        id: mockSubmittedWorkflowWithExtras.id,
      },
    })

    testGetServerSidePropsAuthRedirect({
      getServerSideProps,
      tests: [
        {
          name: "user is not in pilot group",
          session: mockSessionNotInPilot,
          redirect: true,
          context,
        },
        {
          name: "user is only an approver",
          session: mockSessionApprover,
          context,
        },
        {
          name: "user is only a panel approver",
          session: mockSessionPanelApprover,
          redirect: "/workflows/123abc",
          context,
        },
      ],
    })
  })

  describe("when a workflow is manager approved", () => {
    beforeAll(() => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockManagerApprovedWorkflowWithExtras
      )
    })

    const context = makeGetServerSidePropsContext({
      query: {
        id: mockManagerApprovedWorkflowWithExtras.id,
      },
    })

    testGetServerSidePropsAuthRedirect({
      getServerSideProps,
      tests: [
        {
          name: "user is not in pilot group",
          session: mockSessionNotInPilot,
          redirect: true,
          context,
        },
        {
          name: "user is only an approver",
          session: mockSessionApprover,
          redirect: "/workflows/123abc",
          context,
        },
        {
          name: "user is only a panel approver",
          session: mockSessionPanelApprover,
          context,
        },
      ],
    })
  })
})
