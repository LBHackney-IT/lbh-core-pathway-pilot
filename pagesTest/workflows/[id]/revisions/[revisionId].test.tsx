import { mockForm } from "../../../../fixtures/form"
import { mockResident } from "../../../../fixtures/residents"
import { mockRevisionWithActor } from "../../../../fixtures/revisions"
import { mockUser } from "../../../../fixtures/users"
import { mockWorkflowWithExtras } from "../../../../fixtures/workflows"
import { ParsedUrlQuery } from "querystring"
import { render, screen, waitFor, within } from "@testing-library/react"
import { useRouter } from "next/router"
import prisma from "../../../../lib/prisma"
import useResident from "../../../../hooks/useResident"
import useUsers from "../../../../hooks/useUsers"
import WorkflowPage, {
  getServerSideProps,
} from "../../../../pages/workflows/[id]/revisions/[revisionId]"
import { getSession } from "../../../../lib/auth/session"
import {
  mockSession,
  mockSessionNotInPilot,
  mockSessionPanelApprover,
  mockSessionApprover,
} from "../../../../fixtures/session"
import {
  makeGetServerSidePropsContext,
  testGetServerSidePropsAuthRedirect,
} from "../../../../lib/auth/test-functions"

const useRouterReplace = jest.fn()

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  replace: useRouterReplace,
  query: { revisionId: mockWorkflowWithExtras.revisions[0].id },
})

jest.mock("../../../../hooks/useUsers")
;(useUsers as jest.Mock).mockReturnValue({
  data: [mockUser],
})

jest.mock("../../../../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)

jest.mock("../../../../hooks/useResident")
;(useResident as jest.Mock).mockReturnValue({ data: mockResident })

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}))

global.fetch = jest.fn().mockResolvedValue({ json: jest.fn() })

describe("pages/workflows/[id]/revisions/[revisionId]", () => {
  describe("<WorkflowPage />", () => {
    describe("when there are no revisions", function () {
      it("redirects the user to the 404 page", () => {
        render(WorkflowPage({ ...mockWorkflowWithExtras, revisions: [] }))

        expect(useRouterReplace).toBeCalledWith("/404")
      })
    })

    it("displays link to overview of workflow", async () => {
      await waitFor(() => render(WorkflowPage(mockWorkflowWithExtras)))

      expect(screen.getByText("Milestones")).toBeVisible()
      expect(screen.getByText("Milestones")).toHaveAttribute(
        "href",
        `/workflows/${mockWorkflowWithExtras.revisions[0].id}`
      )
    })

    it("displays link to revisions of workflow", async () => {
      await waitFor(() => render(WorkflowPage(mockWorkflowWithExtras)))

      expect(screen.getByText("Revisions")).toBeVisible()
    })

    it("displays links to the current and all revisions of workflow", async () => {
      await waitFor(() => render(WorkflowPage(mockWorkflowWithExtras)))

      const sidebar = within(screen.getAllByRole("complementary")[0])

      expect(
        sidebar.getAllByText(mockWorkflowWithExtras.revisions[0].actor.name)
      ).toHaveLength(mockWorkflowWithExtras.revisions.length + 1)
    })

    it("orders revision answers of a workflow", async () => {
      await waitFor(() =>
        render(
          WorkflowPage({
            ...mockWorkflowWithExtras,
            form: {
              id: "",
              name: "",
              themes: [
                {
                  id: "",
                  name: "",
                  steps: [
                    {
                      id: "foo",
                      name: "",
                      fields: [
                        { id: "Question 1", question: "", type: "text" },
                        { id: "Question 2", question: "", type: "text" },
                        { id: "Question 3", question: "", type: "text" },
                      ],
                    },
                  ],
                },
              ],
            },
            answers: {
              foo: {
                "Question 1": "blah",
                "Question 3": "blah",
                "Question 2": "blah",
              },
            },
            revisions: [
              {
                ...mockRevisionWithActor,
                answers: {
                  foo: {
                    "Question 3": "blah",
                    "Question 1": "blah",
                    "Question 2": "blah",
                  },
                },
              },
            ],
          })
        )
      )

      expect(screen.getAllByTestId("question")[0]).toContainHTML("Question 1")
      expect(screen.getAllByTestId("question")[1]).toContainHTML("Question 2")
      expect(screen.getAllByTestId("question")[2]).toContainHTML("Question 3")
    })
  })

  describe("getServerSideProps", () => {
    describe("when the workflow exists", () => {
      const context = makeGetServerSidePropsContext({
        query: { id: mockWorkflowWithExtras.id },
      })

      testGetServerSidePropsAuthRedirect({
        getServerSideProps,
        tests: [
          {
            name: "user is not in pilot group",
            session: mockSessionNotInPilot,
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

      let response

      beforeAll(async () => {
        ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
          mockWorkflowWithExtras
        )
        response = await getServerSideProps(context)
      })

      it("searches for the workflow with the provided ID", async () => {
        expect(prisma.workflow.findUnique).toBeCalledWith(
          expect.objectContaining({
            where: { id: mockWorkflowWithExtras.id },
          })
        )
      })

      it("orders revisions of a workflow by most recently created", async () => {
        expect(prisma.workflow.findUnique).toBeCalledWith(
          expect.objectContaining({
            include: expect.objectContaining({
              revisions: expect.objectContaining({
                orderBy: {
                  createdAt: "desc",
                },
              }),
            }),
          })
        )
      })

      it("includes revisions of a workflow that are edited", async () => {
        expect(prisma.workflow.findUnique).toBeCalledWith(
          expect.objectContaining({
            include: expect.objectContaining({
              revisions: expect.objectContaining({
                include: {
                  actor: true,
                },
              }),
            }),
          })
        )
      })

      it("includes the users associated to a revision of a workflow", async () => {
        expect(prisma.workflow.findUnique).toBeCalledWith(
          expect.objectContaining({
            include: expect.objectContaining({
              creator: true,
              updater: true,
              revisions: expect.objectContaining({
                include: {
                  actor: true,
                },
              }),
            }),
          })
        )
      })

      it("includes the next review for a revision of a workflow", async () => {
        expect(prisma.workflow.findUnique).toBeCalledWith(
          expect.objectContaining({
            include: expect.objectContaining({
              nextWorkflows: true,
            }),
          })
        )
      })

      it("includes the next steps for a revision of a workflow", async () => {
        expect(prisma.workflow.findUnique).toBeCalledWith(
          expect.objectContaining({
            include: expect.objectContaining({
              nextSteps: true,
            }),
          })
        )
      })

      it("returns the workflow and form as props", async () => {
        expect(response).toHaveProperty(
          "props",
          expect.objectContaining({
            id: mockWorkflowWithExtras.id,
            form: mockForm,
          })
        )
      })
    })

    describe("when the workflow does not exist", function () {
      beforeAll(() => {
        ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(null)
      })

      it("returns 404 if workflow is not found", async () => {
        const response = await getServerSideProps(
          makeGetServerSidePropsContext({
            query: { id: mockWorkflowWithExtras.id } as ParsedUrlQuery,
          })
        )

        expect(response).toHaveProperty("redirect", { destination: "/404" })
      })
    })
  })
})
