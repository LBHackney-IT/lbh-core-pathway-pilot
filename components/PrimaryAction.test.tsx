import { render, screen } from "@testing-library/react"
import { useSession } from "next-auth/client"
import { useRouter } from "next/router"
import { mockApprover, mockPanelApprover, mockUser } from "../fixtures/users"
import { mockWorkflow, MockWorkflowWithExtras } from "../fixtures/workflows"
import PrimaryAction from "./PrimaryAction"
import { getStatus } from "../lib/status"
import { Status } from "../types"

jest.mock("../lib/status")
;(getStatus as jest.Mock).mockReturnValue(Status.InProgress)

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

jest.mock("next-auth/client")

describe("PrimaryAction", () => {
  describe("when user is in the pilot group", () => {
    beforeEach(() => {
      ;(getStatus as jest.Mock).mockClear()
      ;(useSession as jest.Mock).mockReturnValue([
        { user: { ...mockUser, inPilot: true } },
        false,
      ])
    })

    it("shows a resume button for an in-progress workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.InProgress)

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.getByText("Resume"))
    })

    it("shows a review button for a finished workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.NoAction)

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.getByText("Start reassessment"))
    })

    it("shows a review button for a review due soon workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.ReviewSoon)

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.getByText("Start reassessment"))
    })

    it("shows a review button for an overdue workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.Overdue)

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.getByText("Start reassessment"))
    })

    it("doesn't show the approve button if the user is not an approver", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.Submitted)

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.queryByText("Make a decision")).toBeNull()
      expect(screen.queryByRole("button")).toBeNull()
    })

    it("shows the approve button if the user is an approver", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.Submitted)
      ;(useSession as jest.Mock).mockReturnValue([
        { user: { ...mockApprover, inPilot: true } },
        false,
      ])

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.getByText("Make a decision"))
      expect(screen.getByRole("button"))
    })

    it("doesn't show the panel approve button if the user is not an approver", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.ManagerApproved)
      ;(useSession as jest.Mock).mockReturnValue([
        { user: { ...mockApprover, inPilot: true } },
        false,
      ])

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.queryByText("Make a decision")).toBeNull()
      expect(screen.queryByRole("button")).toBeNull()
    })

    it("shows the panel approve button if the user is an approver", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.ManagerApproved)
      ;(useSession as jest.Mock).mockReturnValue([
        { user: { ...mockPanelApprover, inPilot: true } },
        false,
      ])

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.getByText("Make a decision"))
      expect(screen.getByRole("button"))
    })

    it("shows a restore button for a discarded workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.Discarded)
      ;(useSession as jest.Mock).mockReturnValue([
        { user: { ...mockApprover, inPilot: true } },
        false,
      ])

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.getByText("Restore"))
    })

    it("links to the confirm personal details page for a finished workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.NoAction)

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.getByText("Start reassessment")).toHaveAttribute(
        "href",
        `/workflows/${mockWorkflow.id}/confirm-personal-details`
      )
    })

    it("links to the confirm personal details page for a review due soon workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.ReviewSoon)

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.getByText("Start reassessment")).toHaveAttribute(
        "href",
        `/workflows/${mockWorkflow.id}/confirm-personal-details`
      )
    })

    it("links to the confirm personal details page for an overdue workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.Overdue)

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.getByText("Start reassessment")).toHaveAttribute(
        "href",
        `/workflows/${mockWorkflow.id}/confirm-personal-details`
      )
    })
  })

  describe("when user is not in the pilot group", () => {
    beforeEach(() => {
      ;(getStatus as jest.Mock).mockClear()
      ;(useSession as jest.Mock).mockReturnValue([
        { user: { ...mockUser, inPilot: false } },
        false,
      ])
    })

    it("doesn't show a resume button for an in-progress workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.InProgress)

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.queryByText("Resume")).not.toBeInTheDocument()
    })

    it("doesn't show a review button for a finished workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.NoAction)

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.queryByText("Start reassessment")).not.toBeInTheDocument()
    })

    it("doesn't show a review button for a review due soon workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.ReviewSoon)

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.queryByText("Start reassessment")).not.toBeInTheDocument()
    })

    it("doesn't show a review button for an overdue workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.Overdue)

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.queryByText("Start reassessment")).not.toBeInTheDocument()
    })

    it("doesn't show the approve button for a submitted workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.Submitted)
      ;(useSession as jest.Mock).mockReturnValue([
        { user: { ...mockApprover, inPilot: false } },
        false,
      ])

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.queryByText("Make a decision")).toBeNull()
      expect(screen.queryByRole("button")).toBeNull()
    })

    it("doesn't show the approve button for an approved workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.ManagerApproved)
      ;(useSession as jest.Mock).mockReturnValue([
        { user: { ...mockPanelApprover, inPilot: false } },
        false,
      ])

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.queryByText("Make a decision")).toBeNull()
      expect(screen.queryByRole("button")).toBeNull()
    })

    it("shows a restore button for a discarded workflow", () => {
      ;(getStatus as jest.Mock).mockReturnValue(Status.Discarded)
      ;(useSession as jest.Mock).mockReturnValue([
        { user: { ...mockApprover, inPilot: false } },
        false,
      ])

      render(
        <PrimaryAction workflow={mockWorkflow as MockWorkflowWithExtras} />
      )

      expect(screen.queryByText("Restore")).toBeNull()
    })
  })
})
