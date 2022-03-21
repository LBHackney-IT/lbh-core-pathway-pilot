import {act, fireEvent, getByText, screen} from "@testing-library/react"
import {useRouter} from "next/router"
import {mockWorkflow, MockWorkflowWithExtras} from "../fixtures/workflows"
import PrimaryAction from "./PrimaryAction"
import {getStatus} from "../lib/status"
import {Status} from "../types"
import {renderWithSession} from "../lib/auth/test-functions"
import {mockSessionApprover, mockSessionNotInPilot, mockSessionPanelApprover} from "../fixtures/session";
import {csrfFetch} from "../lib/csrfToken";

jest.mock("../lib/status")
;(getStatus as jest.Mock).mockReturnValue(Status.InProgress)

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

jest.mock("../lib/csrfToken")
;(csrfFetch as jest.Mock).mockResolvedValue({
  json: jest.fn().mockResolvedValue({id: 'reassessment'}),
})

const mockWorkFlowWithExtrasAndNextWorkFlows = {
  ...mockWorkflow,
  nextSteps: [],
  nextWorkflows: [mockWorkflow],
} as MockWorkflowWithExtras

describe("components/PrimaryAction", () => {
  describe('when user is an approver', () => {
    it("shows the approve button if the user is an approver", () => {
      (getStatus as jest.Mock).mockReturnValue(Status.Submitted)

      renderWithSession(
        <PrimaryAction
          workflow={mockWorkFlowWithExtrasAndNextWorkFlows}
        />,
        mockSessionApprover,
      )

      expect(screen.getByText("Make a decision"))
      expect(screen.getByRole("button"))
    });

    it("shows a restore button for a discarded workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.Discarded)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>,
        mockSessionApprover,
      )

      expect(screen.getByText("Restore"))
    });
  });

  describe('when the user is a panel approver', function () {
    it("shows the panel approve button", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.ManagerApproved)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>,
        mockSessionPanelApprover,
      )

      expect(screen.getByText("Make a decision"))
      expect(screen.getByRole("button"))
    })
  });

  describe("when user is in the pilot group", () => {
    it("shows a resume button for an in-progress workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.InProgress)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>
      )

      expect(screen.getByText("Resume"))
    })

    it("shows a review button for a finished workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.NoAction)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>
      )

      expect(screen.getByText("Start reassessment"))
    })

    it("shows a review button for a review due soon workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.ReviewSoon)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>
      )

      expect(screen.getByText("Start reassessment"))
    })

    it("shows a review button for an overdue workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.Overdue)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>
      )

      expect(screen.getByText("Start reassessment"))
    })

    it("doesn't show the approve button if the user is not an approver", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.Submitted)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>
      )

      expect(screen.queryByText("Make a decision")).toBeNull()
      expect(screen.queryByRole("button")).toBeNull()
    })

    it("doesn't show the panel approve button if the user is not an approver", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.ManagerApproved)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>
      )

      expect(screen.queryByText("Make a decision")).toBeNull()
      expect(screen.queryByRole("button")).toBeNull()
    })

    it("links to the confirm personal details page for a finished workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.NoAction)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>
      )

      act(() => {
        fireEvent.click(screen.getByText("Start reassessment"))
      })

      expect(csrfFetch).toHaveBeenCalledWith("/api/workflows", {
        method: "POST",
        body: JSON.stringify({
          "formId": "mock-form",
          "socialCareId": "123",
          "workflowId": "123abc",
          "type": "Reassessment",
          "answers": {"Reassessment": {}}
        }),
      });
    })

    it("links to the confirm personal details page for a review due soon workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.ReviewSoon)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>
      )

      act(() => {
        fireEvent.click(screen.getByText("Start reassessment"))
      })

      expect(csrfFetch).toHaveBeenCalledWith("/api/workflows", {
        method: "POST",
        body: JSON.stringify({
          "formId": "mock-form",
          "socialCareId": "123",
          "workflowId": "123abc",
          "type": "Reassessment",
          "answers": {"Reassessment": {}}
        }),
      });
    })

    it("links to the confirm personal details page for an overdue workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.Overdue)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>
      )

      act(() => {
        fireEvent.click(screen.getByText("Start reassessment"))
      })

      expect(csrfFetch).toHaveBeenCalledWith("/api/workflows", {
        method: "POST",
        body: JSON.stringify({
          "formId": "mock-form",
          "socialCareId": "123",
          "workflowId": "123abc",
          "type": "Reassessment",
          "answers": {"Reassessment": {}}
        }),
      });
    })
  })

  describe("when user is not in the pilot group", () => {
    it("doesn't show a resume button for an in-progress workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.InProgress)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>,
        mockSessionNotInPilot,
      )

      expect(screen.queryByText("Resume")).not.toBeInTheDocument()
    })

    it("doesn't show a review button for a finished workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.NoAction)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>,
        mockSessionNotInPilot,
      )

      expect(screen.queryByText("Start reassessment")).not.toBeInTheDocument()
    })

    it("doesn't show a review button for a review due soon workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.ReviewSoon)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>,
        mockSessionNotInPilot,
      )

      expect(screen.queryByText("Start reassessment")).not.toBeInTheDocument()
    })

    it("doesn't show a review button for an overdue workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.Overdue)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>,
        mockSessionNotInPilot,
      )

      expect(screen.queryByText("Start reassessment")).not.toBeInTheDocument()
    })

    it("doesn't show the approve button for a submitted workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.Submitted)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>,
        mockSessionNotInPilot,
      )

      expect(screen.queryByText("Make a decision")).toBeNull()
      expect(screen.queryByRole("button")).toBeNull()
    })

    it("doesn't show the approve button for an approved workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.ManagerApproved)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>,
        mockSessionNotInPilot,
      )

      expect(screen.queryByText("Make a decision")).toBeNull()
      expect(screen.queryByRole("button")).toBeNull()
    })

    it("shows a restore button for a discarded workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.Discarded)

      renderWithSession(
        <PrimaryAction workflow={mockWorkFlowWithExtrasAndNextWorkFlows}/>,
        mockSessionNotInPilot,
      )

      expect(screen.queryByText("Restore")).toBeNull()
    })
  })
})
