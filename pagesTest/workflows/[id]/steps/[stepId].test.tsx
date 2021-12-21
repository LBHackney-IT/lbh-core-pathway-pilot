import { allSteps } from "../../../../config/forms"
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
import StepPage, {
  getServerSideProps,
} from "../../../../pages/workflows/[id]/steps/[stepId]"
import prisma from "../../../../lib/prisma"
import { getLoginUrl, getSession } from "../../../../lib/auth/session"
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
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useRouter } from "next/router"
import Layout from "../../../../components/_Layout"
import {
  AutosaveIndicator,
  AutosaveProvider,
  useAutosave,
  AutosaveTrigger,
} from "../../../../contexts/autosaveContext"

jest.mock("../../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn(),
  },
}))

jest.mock("../../../../lib/residents")
;(getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("../../../../lib/auth/session")
;(getSession as jest.Mock).mockResolvedValue(mockSession)
;(getLoginUrl as jest.Mock).mockImplementation(
  (url = "") => `auth-server${url}`
)

jest.mock("next/router")

jest.mock("../../../../lib/residents")

jest.mock("../../../../components/_Layout")
;(Layout as jest.Mock).mockImplementation(({ children }) => <>{children}</>)

jest.mock("../../../../contexts/autosaveContext")
;(AutosaveProvider as jest.Mock).mockImplementation(({ children }) => (
  <>{children}</>
))
;(AutosaveIndicator as jest.Mock).mockImplementation(() => <></>)
;(useAutosave as jest.Mock).mockReturnValue({
  setSaved: jest.fn(),
  saved: true,
})
;(AutosaveTrigger as jest.Mock).mockImplementation(() => <></>)

global.fetch = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue({ error: false }),
})

document.head.insertAdjacentHTML(
  "afterbegin",
  '<meta http-equiv="XSRF-TOKEN" content="test" />'
)

describe("pages/workflows/[id]/steps/[stepId].getServerSideProps", () => {
  ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow)

  it("returns the workflow and all steps for forms as props", async () => {
    const response = await getServerSideProps(
      makeGetServerSidePropsContext({
        query: {
          id: mockWorkflow.id,
          stepId: mockForm.themes[0].steps[0].id,
        } as ParsedUrlQuery,
      })
    )

    expect(response).toHaveProperty(
      "props",
      expect.objectContaining({
        workflow: mockWorkflow,
        allSteps: await allSteps(),
      })
    )
  })

  describe("when a workflow doesn't exist", () => {
    let response

    beforeAll(async () => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(null)

      response = await getServerSideProps(
        makeGetServerSidePropsContext({
          query: {
            id: mockWorkflow.id,
            stepId: mockForm.themes[0].steps[0].id,
          },
        })
      )
    })

    it("returns a redirect to /404", () => {
      expect(response).toHaveProperty(
        "redirect",
        expect.objectContaining({
          destination: "/404",
        })
      )
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
          redirect: "/workflows/123abc",
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
        stepId: mockForm.themes[0].steps[0].id,
      },
    })

    testGetServerSidePropsAuthRedirect({
      getServerSideProps,
      tests: [
        {
          name: "user is not in pilot group",
          session: mockSessionNotInPilot,
          redirect: "/workflows/123abc",
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
        stepId: mockForm.themes[0].steps[0].id,
      },
    })

    testGetServerSidePropsAuthRedirect({
      getServerSideProps,
      tests: [
        {
          name: "user is not in pilot group",
          session: mockSessionNotInPilot,
          redirect: "/workflows/123abc",
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

  describe("when a workflow is a reassessment", () => {
    let response

    beforeAll(async () => {
      ;(prisma.workflow.findUnique as jest.Mock).mockResolvedValue(
        mockWorkflowWithExtras
      )

      response = await getServerSideProps(
        makeGetServerSidePropsContext({
          query: {
            id: mockWorkflowWithExtras.id,
            stepId: mockForm.themes[0].steps[0].id,
          },
        })
      )
    })

    it("returns a redirect to the step page for a reassessment", () => {
      expect(response).toHaveProperty(
        "redirect",
        expect.objectContaining({
          destination: `/reviews/123abc/steps/${mockForm.themes[0].steps[0].id}`,
          statusCode: 307,
        })
      )
    })
  })
})

describe("<StepPage />", () => {
  describe("when the step exists", () => {
    let steps

    beforeAll(async () => {
      ;(useRouter as jest.Mock).mockReturnValue({
        query: { id: mockWorkflow.id, stepId: mockForm.themes[0].steps[0].id },
        push: jest.fn(),
      })
      steps = await allSteps()
    })

    it("displays the name of the step", async () => {
      await waitFor(() => {
        render(<StepPage workflow={mockWorkflowWithExtras} allSteps={steps} />)
      })

      expect(
        screen.getByRole("heading", { level: 1, name: "Mock step" })
      ).toBeVisible()
    })

    it("displays the form for the step", async () => {
      await waitFor(() => {
        render(<StepPage workflow={mockWorkflowWithExtras} allSteps={steps} />)
      })

      expect(screen.getByLabelText("Mock question?")).toBeVisible()
    })

    describe("and API response is successful", () => {
      it("calls API to update workflow", async () => {
        await waitFor(() => {
          render(
            <StepPage workflow={mockWorkflowWithExtras} allSteps={steps} />
          )

          fireEvent.change(screen.getByLabelText("Mock question?"), {
            target: { value: "Some answer" },
          })
          fireEvent.click(screen.getByText("Save and continue"))
        })

        expect(fetch).toHaveBeenCalledWith(
          "/api/workflows/123abc/steps/mock-step",
          {
            body: JSON.stringify({ "mock-question": "Some answer" }),
            method: "PATCH",
            headers: { "XSRF-TOKEN": "test" },
          }
        )
      })
    })

    describe("and API response returns an error", () => {
      it("displays there is a problem and the error", async () => {
        global.fetch = jest.fn().mockResolvedValue({
          json: jest.fn().mockResolvedValue({ error: "Some error" }),
        })

        await waitFor(() => {
          render(
            <StepPage workflow={mockWorkflowWithExtras} allSteps={steps} />
          )

          fireEvent.change(screen.getByLabelText("Mock question?"), {
            target: { value: "Some answer" },
          })
          fireEvent.click(screen.getByText("Save and continue"))
        })

        expect(
          screen.getByText("There was a problem submitting your answers")
        ).toBeVisible()
        expect(screen.getByText("Some error")).toBeVisible()
      })
    })

    describe("and it has an introduction", () => {
      it("displays the introduction", async () => {
        steps[0].intro = "Some introduction for Mock step."

        await waitFor(() => {
          render(
            <StepPage workflow={mockWorkflowWithExtras} allSteps={steps} />
          )
        })

        expect(
          screen.getByText("Some introduction for Mock step.")
        ).toBeVisible()
      })
    })

    describe("and it has an early finish", () => {
      it("displays link to skip to next steps", async () => {
        steps[0].earlyFinish = true

        await waitFor(() => {
          render(
            <StepPage workflow={mockWorkflowWithExtras} allSteps={steps} />
          )
        })

        expect(screen.getByText("skip to next steps")).toHaveAttribute(
          "href",
          "/workflows/123abc/finish"
        )
      })
    })
  })

  describe("when the step doesn't exist", () => {
    const useRouterReplace = jest.fn()
    let steps

    beforeAll(async () => {
      ;(useRouter as jest.Mock).mockReturnValue({
        query: { id: mockWorkflow.id, stepId: "some-nonexistent-step" },
        replace: useRouterReplace,
      })
      steps = await allSteps()
    })

    it("replaces URL with /404", async () => {
      await waitFor(() => {
        render(<StepPage workflow={mockWorkflowWithExtras} allSteps={steps} />)
      })

      expect(useRouterReplace).toHaveBeenCalledWith("/404")
    })
  })
})
