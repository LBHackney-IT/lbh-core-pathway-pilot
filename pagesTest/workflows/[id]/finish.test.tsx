import { mockForm, mockForms } from "../../../fixtures/form"
import { mockResident } from "../../../fixtures/residents"
import {
  mockWorkflow,
  mockWorkflowWithExtras,
} from "../../../fixtures/workflows"
import { getResidentById } from "../../../lib/residents"
import FinishWorkflowPage, {
  getServerSideProps,
} from "../../../pages/workflows/[id]/finish"
import { getSession } from "../../../lib/auth/session"
import {
  mockSession,
  mockSessionNotInPilot,
  mockSessionPanelApprover,
  mockSessionApprover,
} from "../../../fixtures/session"
import {
  makeGetServerSidePropsContext,
  testGetServerSidePropsAuthRedirect,
} from "../../../lib/auth/test-functions"
import prisma from "../../../lib/prisma"
import { fireEvent, render, screen, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRouter } from "next/router"
import Layout from "../../../components/_Layout"
import useResident from "../../../hooks/useResident"
import useUsers from "../../../hooks/useUsers"
import { useWorkflowsByResident } from "../../../hooks/useWorkflowsByResident"
import { mockApprover } from "../../../fixtures/users"
import { screeningFormId } from "../../../config"
import useNextSteps from "../../../hooks/useNextSteps"
import { mockNextStepOptions } from "../../../fixtures/nextStepOptions"
import { beforeEach } from "@jest/globals";

jest.mock("../../../lib/prisma", () => ({
  workflow: {
    findUnique: jest.fn().mockResolvedValue(mockWorkflowWithExtras),
  },
}))

jest.mock("../../../lib/residents")
  ; (getResidentById as jest.Mock).mockResolvedValue(mockResident)

jest.mock("../../../lib/auth/session")
  ; (getSession as jest.Mock).mockResolvedValue(mockSession)

jest.mock("next/router")
  ; (useRouter as jest.Mock).mockReturnValue({
    query: { id: mockWorkflow.id },
    push: jest.fn(),
  })

jest.mock("../../../components/_Layout")
  ; (Layout as jest.Mock).mockImplementation(({ children }) => <>{children}</>)

jest.mock("../../../hooks/useResident")
  ; (useResident as jest.Mock).mockReturnValue({ data: mockResident })

jest.mock("../../../hooks/useUsers")
  ; (useUsers as jest.Mock).mockReturnValue({
    data: [mockApprover],
  })

jest.mock("../../../hooks/useWorkflowsByResident")
  ; (useWorkflowsByResident as jest.Mock).mockReturnValue({
    data: {
      workflows: [
        {
          ...mockWorkflow,
          id: "098zyx",
          updatedAt: new Date(
            "January 25, 2022 14:00:00"
          ).toISOString() as unknown as Date,
          formId: "Guided meditation",
        },
      ],
    },
  })

jest.mock("../../../hooks/useNextSteps")
const mockNextSteps = {
  options: mockNextStepOptions,
}
  ; (useNextSteps as jest.Mock).mockReturnValue({ data: mockNextSteps })

global.fetch = jest.fn().mockResolvedValue({ json: jest.fn() })

document.head.insertAdjacentHTML(
  "afterbegin",
  '<meta http-equiv="XSRF-TOKEN" content="test" />'
)

beforeEach(() => {
  ; (fetch as jest.Mock).mockClear()
})

describe("page/workflows/[id]/finish.getServerSideProps", () => {
  const context = makeGetServerSidePropsContext({
    query: {
      id: mockWorkflowWithExtras.id,
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

  it("returns the workflow and form as props", async () => {
    const response = await getServerSideProps(context)
    expect(response).toHaveProperty("props", {
      workflow: expect.objectContaining({
        id: mockWorkflowWithExtras.id,
        form: mockForm,
      }),
      forms: [mockForm],
    })
  })

  it("calls Prisma to find workflow and include next steps", async () => {
    await getServerSideProps(context)

    expect(prisma.workflow.findUnique).toBeCalledWith(
      expect.objectContaining({
        where: {
          id: mockWorkflowWithExtras.id,
        },
        include: {
          nextSteps: true,
        },
      })
    )
  })

  describe("when a workflow doesn't exist", () => {
    let response

    beforeAll(async () => {
      ; (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(null)

      response = await getServerSideProps(
        makeGetServerSidePropsContext({
          query: {
            id: mockWorkflowWithExtras.id,
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

  describe("when a workflow is submitted", () => {
    let response

    beforeAll(async () => {
      ; (prisma.workflow.findUnique as jest.Mock).mockResolvedValue({
        ...mockWorkflowWithExtras,
        submittedAt: new Date(),
      })

      response = await getServerSideProps(
        makeGetServerSidePropsContext({
          query: {
            id: mockWorkflowWithExtras.id,
          },
        })
      )
    })

    it("returns a redirect to overview page for the workflow", () => {
      expect(response).toHaveProperty(
        "redirect",
        expect.objectContaining({
          destination: "/workflows/123abc",
        })
      )
    })
  })
})

describe("<FinishWorkflowPage />", () => {
  describe('when finishing a linked workflow', () => {
    beforeEach(() => {
      render(
        <FinishWorkflowPage
          workflow={{ ...mockWorkflowWithExtras, form: mockForm }}
          forms={mockForms}
        />
      )
    });
    it("displays the title", async () => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Next steps and approval" })
      ).toBeVisible()
    })

    it("displays a list of approvers", async () => {
      await waitFor(() => fireEvent.click(screen.getByRole("combobox", {
        name: /Who should approve this?/,
      })))
      expect(screen.getByText("Firstname Surname (firstname.surname@hackney.gov.uk)")).toBeVisible()
    })

    it.only("displays the approvers email if they have no name", async () => {
      ; (useUsers as jest.Mock).mockReturnValue({
        data: [{ ...mockApprover, name: null }],
      })

      render(
        <FinishWorkflowPage
          workflow={{ ...mockWorkflowWithExtras, form: mockForm }}
          forms={mockForms}
        />
      )

      await waitFor(() => fireEvent.click(screen.getByRole("combobox", {
        name: /Who should approve this?/,
      })))

      expect(screen.getByText("firstname.surname@hackney.gov.uk")).toBeVisible()
    })

    describe("when a review date isn't chosen", () => {
      it("displays an error", async () => {
        await waitFor(() => fireEvent.click(screen.getByText("Finish and send")))
        expect(screen.getByText("You must provide a review date")).toBeVisible()
      })
    })
    describe("when an approver isn't chosen", () => {
      it("displays an error", async () => {
        await waitFor(() => fireEvent.click(screen.getByText("Finish and send")))
        expect(screen.getByText("You must provide a user")).toBeVisible()
      })
    })

    it("does not display the workflow link box", async () => {
      expect(
        screen.queryAllByText(
          "Is this linked to any of this resident's earlier assessments?"
        )
      ).toHaveLength(0);
    })
  });

  describe('when finishing an unlinked workflow', () => {
    beforeEach(() => {
      render(
        <FinishWorkflowPage
          workflow={{ ...mockWorkflowWithExtras, workflowId: null }}
          forms={mockForms}
        />
      )
    });
    it("displays the title", async () => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Next steps and approval" })
      ).toBeVisible()
    })

    it("displays a list of linkable workflows when you click on the workflow box", async () => {
      fireEvent.click(screen.getByText("None"))
      expect(screen.getByText("Guided meditation (last edited 25 Jan 2022)"))
    })
    describe("when a review date isn't chosen", () => {
      it("displays an error", async () => {
        await waitFor(() => fireEvent.click(screen.getByText("Finish and send")))
        expect(screen.getByText("You must provide a review date")).toBeVisible()
      })
    })
    describe("when an approver isn't chosen", () => {
      it("displays an error", async () => {
        await waitFor(() => fireEvent.click(screen.getByText("Finish and send")))
        expect(screen.getByText("You must provide a user")).toBeVisible()
      })
    })

    it("displays a list of linkable workflows when you click on the workflow box", async () => {
      fireEvent.click(screen.getByText("None"))
      expect(screen.getByText("Guided meditation (last edited 25 Jan 2022)"))
    })

    it("displays the workflow link box", async () => {
      expect(
        screen.getByText(
          "Is this linked to any of this resident's earlier assessments?"
        )
      ).toBeVisible()
      expect(screen.getByText("None")).toBeVisible()
    })
  });


  describe("when a screening assessment", () => {
    it("doesn't display the review date question", async () => {
      render(
        <FinishWorkflowPage
          workflow={{ ...mockWorkflowWithExtras, form: { ...mockForm, id: screeningFormId } }}
          forms={mockForms}
        />
      )
      expect(
        screen.queryByText("When should this be reviewed?", { exact: false })
      ).not.toBeInTheDocument()
    })
  })

  describe("form does not need for approving", () => {
    const nonApprovableForm = {
      ...mockForm,
      approvable: false
    }

    const nonApprovableWorkflow = {
      ...mockWorkflowWithExtras,
      workflowId: "",
      nextSteps: [],
      form: nonApprovableForm
    }

    it("does not display approvable dropdown if the form is not approvable", async () => {
      render(
        <FinishWorkflowPage
          workflow={nonApprovableWorkflow}
          forms={[nonApprovableForm]}
        />)

      expect(screen.queryByText("Who should approve this?")).toBeNull()
    })

    it("submits approver as empty string when form is not approvable", async () => {
      await waitFor(() => {
        render(
          <FinishWorkflowPage
            workflow={nonApprovableWorkflow}
            forms={[nonApprovableForm]}
          />
        )
        fireEvent.click(screen.getByText("No review needed"))
      })

      const linkedWorkflowSelection = screen.getByLabelText(
        "Is this linked to any of this resident's earlier assessments?"
      )

      fireEvent.change(linkedWorkflowSelection, { target: { value: "098zyx" } })

      await waitFor(() => {
        fireEvent.click(screen.queryByText("Finish and send"))
      })

      expect(fetch).toBeCalledWith("/api/workflows/123abc/finish", {
        body: JSON.stringify({
          approverEmail: "",
          reviewQuickDate: "no-review",
          reviewBefore: "",
          workflowId: "098zyx",
          nextSteps: [],
        }),
        method: "POST",
        headers: { "XSRF-TOKEN": "test" },
      })
    })
  })

  it("calls API to finish the workflow", async () => {
    render(
      <FinishWorkflowPage
        workflow={{
          ...mockWorkflowWithExtras,
          workflowId: "",
          nextSteps: [],
          form: mockForm,
        }}
        forms={mockForms}
      />
    )

    act(() => {
      fireEvent.click(screen.getByText("No review needed"))
      userEvent.selectOptions(
        screen.getByRole("combobox", {
          name: /Who should approve this?/,
        }),
        [mockApprover.email]
      )
    })
    const linkedWorkflowSelection = screen.getByLabelText(
      "Is this linked to any of this resident's earlier assessments?"
    )
    fireEvent.change(linkedWorkflowSelection, { target: { value: "098zyx" } })
    await waitFor(() => {
      fireEvent.click(screen.getByText("Finish and send"))
    })
    expect(fetch).toHaveBeenCalledWith("/api/workflows/123abc/finish", {
      body: JSON.stringify({
        approverEmail: "firstname.surname@hackney.gov.uk",
        reviewQuickDate: "no-review",
        reviewBefore: "",
        workflowId: "098zyx",
        nextSteps: [],
      }),
      method: "POST",
      headers: { "XSRF-TOKEN": "test" },
    })
  })
})
