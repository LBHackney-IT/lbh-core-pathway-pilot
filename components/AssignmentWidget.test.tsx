import AssignmentWidget from "./AssignmentWidget"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import useUsers from "../hooks/useUsers"
import useAssignment from "../hooks/useAssignment"
import { mockUser } from "../fixtures/users"
import { Team } from "@prisma/client"
import { Status } from "../types"
import { SessionContext } from "../lib/auth/SessionContext";
import { mockSession, mockSessionNotInPilot } from "../fixtures/session";
import { UserSession } from "../lib/auth/types";

jest.mock("../hooks/useUsers")
  ; (useUsers as jest.Mock).mockReturnValue({
    data: [mockUser],
  })

jest.mock("../hooks/useAssignment")
  ; (useAssignment as jest.Mock).mockReturnValue({
    data: {
      assignee: null,
      teamAssignedTo: null,
    },
  })

global.fetch = jest.fn()
document.head.insertAdjacentHTML(
  "afterbegin",
  '<meta http-equiv="XSRF-TOKEN" content="test" />'
)

beforeEach(() => {
  jest.clearAllMocks()
})

const renderWidget = (status: Status = Status.InProgress, session: UserSession = mockSession) => {
  render(
    <SessionContext.Provider value={session}>
      <AssignmentWidget status={status} workflowId="123" />
    </SessionContext.Provider>
  )
}

describe("AssignmentWidget", () => {
  describe("when user is in the pilot group", () => {
    it("renders correctly when there is no one assigned", () => {
      renderWidget();

      expect(
        screen.getByText("No one is assigned", { exact: false })
      ).toBeVisible()

      fireEvent.click(screen.getByText("Assign someone?"))

      expect(screen.getByRole("heading")).toBeVisible()
      expect(screen.getAllByRole("combobox").length).toBe(2)
      expect(screen.getAllByDisplayValue("Unassigned").length).toBe(2)
      expect(screen.getAllByRole("button").length).toBe(3)
    })

    it("can assign a person and a team", async () => {
      renderWidget();

      fireEvent.click(screen.getByText("Assign someone?"))
      fireEvent.change(screen.getAllByRole("combobox")[0], {
        target: { value: Team.Access },
      })
      fireEvent.change(screen.getAllByRole("combobox")[1], {
        target: { value: "firstname.surname@hackney.gov.uk" },
      })

      await act(
        async () => await fireEvent.click(screen.getByText("Save changes"))
      )

      expect(fetch).toBeCalledWith("/api/workflows/123/assignment", {
        body: JSON.stringify({
          assignedTo: "firstname.surname@hackney.gov.uk",
          teamAssignedTo: Team.Access,
        }),
        headers: { "XSRF-TOKEN": "test" },
        method: "PATCH",
      })
    })

    it("can assign to me", async () => {
      renderWidget();
      fireEvent.click(screen.getByText("Assign someone?"))

      await act(
        async () => await fireEvent.click(screen.getByText("Assign to me"))
      )

      expect(fetch).toBeCalledWith("/api/workflows/123/assignment", {
        body: JSON.stringify({
          assignedTo: "firstname.surname@hackney.gov.uk",
          teamAssignedTo: null,
        }),
        headers: { "XSRF-TOKEN": "test" },
        method: "PATCH",
      })
    })

    it("renders correctly when someone is assigned", () => {
      ; (useAssignment as jest.Mock).mockReturnValue({
        data: {
          assignee: mockUser,
          assignedTeam: "Sensory",
        },
      })

      renderWidget();

      expect(
        screen.getByText("Assigned to Firstname Surname", { exact: false })
      ).toBeVisible()

      fireEvent.click(screen.getByText("Reassign"))

      expect(screen.getByDisplayValue("Firstname Surname")).toBeVisible()
    })

    it("renders correctly when there a team but no person assigned", () => {
      ; (useAssignment as jest.Mock).mockReturnValue({
        data: {
          assignee: null,
          teamAssignedTo: Team.Access,
        },
      })

      renderWidget();

      expect(screen.getByText(/Assigned to Access team/)).toBeVisible()
      expect(screen.getByText("Reassign"))
    })

    it("only shows qam approvers if the workflow has been manager-approved already", () => {
      renderWidget(Status.ManagerApproved)
      fireEvent.click(screen.getByText("Reassign"))

      expect(screen.getAllByRole("option").length).toBe(15)
    })

    it("can un-assign a person and a team", async () => {
      ; (useAssignment as jest.Mock).mockReturnValue({
        data: {
          assignee: mockUser,
          assignedTeam: Team.Access,
        },
      });
      renderWidget();

      fireEvent.click(screen.getByText("Reassign"))
      fireEvent.change(screen.getByLabelText("Assign to a user"), {
        target: { value: "Unassigned" },
      })
      fireEvent.change(screen.getByLabelText("Assign to a team"), {
        target: { value: "Unassigned" },
      })

      await act(
        async () => await fireEvent.click(screen.getByText("Save changes"))
      )

      expect(fetch).toBeCalledWith("/api/workflows/123/assignment", {
        body: JSON.stringify({
          assignedTo: null,
          teamAssignedTo: null,
        }),
        headers: { "XSRF-TOKEN": "test" },
        method: "PATCH",
      })
    })

    describe("when no team is selected", () => {
      it("groups users by their team in the users dropdown", async () => {
        ; (useAssignment as jest.Mock).mockReturnValue({
          data: {
            assignee: null,
            assignedTeam: null,
          },
        })
          ; (useUsers as jest.Mock).mockReturnValue({
            data: [
              {
                ...mockUser,
                id: "1abc",
                name: "Jane Access",
                team: Team.Access,
              },
              {
                ...mockUser,
                id: "2abc",
                name: "John Access",
                team: Team.Access,
              },
              {
                ...mockUser,
                id: "3abc",

                name: "Jane Review",
                team: Team.Review,
              },
              {
                ...mockUser,
                id: "4abc",
                name: "John No Team",
                team: null,
              },
            ],
          })

        renderWidget();

        await waitFor(() => {
          fireEvent.click(screen.getByText("Assign someone?"))
        })

        const usersDropdown = screen.getByRole("combobox", {
          name: /Assign to a user/,
        })
        const usersDropdownOptions = usersDropdown.childNodes

        expect(usersDropdownOptions).toHaveLength(4)
        expect(usersDropdownOptions[0]).toHaveValue("")
        expect(usersDropdownOptions[1]).toHaveAttribute("label", "Access")
        expect(usersDropdownOptions[1].childNodes[0]).toHaveTextContent(
          "Jane Access"
        )
        expect(usersDropdownOptions[1].childNodes[1]).toHaveTextContent(
          "John Access"
        )
        expect(usersDropdownOptions[2]).toHaveAttribute("label", "Review")
        expect(usersDropdownOptions[2].childNodes[0]).toHaveTextContent(
          "Jane Review"
        )
        expect(usersDropdownOptions[3]).toHaveAttribute("label", "No team")
        expect(usersDropdownOptions[3].childNodes[0]).toHaveTextContent(
          "John No Team"
        )
      })

      it("sorts teams by name with no team at the bottom in the users dropdown", async () => {
        ; (useAssignment as jest.Mock).mockReturnValue({
          data: {
            assignee: null,
            assignedTeam: null,
          },
        })
          ; (useUsers as jest.Mock).mockReturnValue({
            data: [
              {
                ...mockUser,
                id: "3abc",
                name: "Jane Review",
                team: Team.Review,
              },
              {
                ...mockUser,
                id: "2abc",
                name: "John Access",
                team: Team.Access,
              },
              {
                ...mockUser,
                id: "4abc",
                name: "John No Team",
                team: null,
              },
              {
                ...mockUser,
                id: "1abc",
                name: "Jane Access",
                team: Team.Access,
              },
            ],
          })

        renderWidget();

        await waitFor(() => {
          fireEvent.click(screen.getByText("Assign someone?"))
        })

        const usersDropdown = screen.getByRole("combobox", {
          name: /Assign to a user/,
        })
        const usersDropdownOptions = usersDropdown.childNodes

        expect(usersDropdownOptions).toHaveLength(4)
        expect(usersDropdownOptions[0]).toHaveTextContent("Unassigned")
        expect(usersDropdownOptions[1]).toHaveAttribute("label", "Access")
        expect(usersDropdownOptions[2]).toHaveAttribute("label", "Review")
        expect(usersDropdownOptions[3]).toHaveAttribute("label", "No team")
      })
    })
  })

  describe("when user is not in the pilot group", () => {
    it("doesn't allow assignment when there is no one assigned", () => {
      ; (useAssignment as jest.Mock).mockReturnValue({
        data: {
          assignee: null,
          teamAssignedTo: null,
        },
      })

      renderWidget(Status.InProgress, mockSessionNotInPilot);

      expect(screen.getByText("No one is assigned")).toBeVisible()
      expect(screen.queryByText("Assign someone?")).not.toBeInTheDocument()
    })

    it("doesn't allow assignment when someone is assigned", () => {
      ; (useAssignment as jest.Mock).mockReturnValue({
        data: {
          assignee: mockUser,
          assignedTeam: "Sensory",
        },
      })

      renderWidget(Status.InProgress, mockSessionNotInPilot);

      expect(screen.getByText("Assigned to Firstname Surname")).toBeVisible()
      expect(screen.queryByText("Reassign")).not.toBeInTheDocument()
    })

    it("doesn't allow assignment when there a team but no person assigned", () => {
      ; (useAssignment as jest.Mock).mockReturnValue({
        data: {
          assignee: null,
          teamAssignedTo: Team.Access,
        },
      });
      renderWidget(Status.InProgress, mockSessionNotInPilot);

      expect(screen.getByText(/Assigned to Access team/)).toBeVisible()
      expect(screen.queryByText("Reassign")).not.toBeInTheDocument()
    })
  })

  describe("when a user has no name", () => {
    it("displays the user's email instead of their name", async () => {
      ; (useAssignment as jest.Mock).mockReturnValue({
        data: {
          assignee: null,
          assignedTeam: null,
        },
      })

        ; (useUsers as jest.Mock).mockReturnValue({
          data: [
            {
              ...mockUser,
              id: "2abc",
              name: "John Access",
              team: Team.Access,
            },
            {
              ...mockUser,
              id: "1abc",
              name: "",
              team: Team.Access,
              email: "test.test@test.com"
            },
            {
              ...mockUser,
              id: "3abc",
              name: null,
              team: Team.Review,
            },
            {
              ...mockUser,
              id: "4abc",
              name: "John No Team",
              team: null,
            },
          ],
        })

      renderWidget();

      await waitFor(() => {
        fireEvent.click(screen.getByText("Assign someone?"))
      })

      const usersDropdown = screen.getByRole("combobox", {
        name: /Assign to a user/,
      })
      const usersDropdownOptions = usersDropdown.childNodes

      expect(usersDropdownOptions).toHaveLength(4)
      expect(usersDropdownOptions[0]).toHaveTextContent("Unassigned")
      expect(usersDropdownOptions[1].childNodes[0]).toHaveTextContent(
        "John Access"
      )
      expect(usersDropdownOptions[1].childNodes[1]).toHaveTextContent(
        "test.test@test.com"
      )
      expect(usersDropdownOptions[2].childNodes[0]).toHaveTextContent(
        "firstname.surname@hackney.gov.uk"
      )
      expect(usersDropdownOptions[3].childNodes[0]).toHaveTextContent(
        "John No Team"
      )

    })
  })
})
