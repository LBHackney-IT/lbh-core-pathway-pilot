import { describe, test } from "@jest/globals"
import { screen } from "@testing-library/react"
import { mockWorkflowWithExtras } from "../../fixtures/workflows"
import { Status } from "../../types"
import KanbanCard from "./KanbanCard"
import { renderWithSession } from "../../lib/auth/test-functions"
import useResident from "../../hooks/useResident"
import { mockResident } from "../../fixtures/residents"
import { mockUser } from "../../fixtures/users"

jest.mock("../../hooks/useResident")
;(useResident as jest.Mock).mockReturnValue({
  data: mockResident,
})

describe("components/NewDashboard/KanbanCard", () => {
  describe("an in-progress status", () => {
    beforeEach(() =>
      renderWithSession(
        <KanbanCard
          workflow={mockWorkflowWithExtras}
          status={Status.InProgress}
        />
      )
    )

    test("displays a link to the workflow", () => {
      expect(
        screen.getByText("Resident Firstname Resident Surname").closest("a")
      ).toHaveAttribute("href", `/workflows/${mockWorkflowWithExtras.id}`)
    })

    test("displays the residents name", () => {
      expect(
        screen.getByText("Resident Firstname Resident Surname")
      ).toBeVisible()
    })

    test("displays the workflow form type", () => {
      expect(screen.getByText(/Mock form/)).toBeVisible()
    })
  })

  describe("render with missing information", () => {
    test("displays the KanbanCard using the initials from the email address when the assigned user has null as name", () => {
      const workflowNullAssigneeName = {
        ...mockWorkflowWithExtras,
        assignee: {
          ...mockUser,
          name: null,
          email: "test.surname@hackney.gov.uk",
        },
      }
      renderWithSession(
        <KanbanCard
          workflow={workflowNullAssigneeName}
          status={Status.InProgress}
        />
      )

      expect(screen.getByText("TS")).toBeVisible()
    })

    test("displays the KanbanCard using the initials from the email address when the assigned user has empty string as name", () => {
      const workflowNullAssigneeName = {
        ...mockWorkflowWithExtras,
        assignee: {
          ...mockUser,
          name: "",
          email: "test.surname@hackney.gov.uk",
        },
      }
      renderWithSession(
        <KanbanCard
          workflow={workflowNullAssigneeName}
          status={Status.InProgress}
        />
      )
      expect(screen.getByText("TS")).toBeVisible()
    })

    test("displays the KanbanCard with ?? instead of initials when the assigned user has null as name and no email address", () => {
      const workflowNullAssigneeName = {
        ...mockWorkflowWithExtras,
        assignee: {
          ...mockUser,
          name: "",
          email: "",
        },
      }
      renderWithSession(
        <KanbanCard
          workflow={workflowNullAssigneeName}
          status={Status.InProgress}
        />
      )
      expect(screen.getByText("??")).toBeVisible()
    })
  })
})
