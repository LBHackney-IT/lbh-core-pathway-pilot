import AssignmentWidget from "./AssignmentWidget"
import { render, screen, fireEvent } from "@testing-library/react"
import useUsers from "../hooks/useUsers"
import useAssignment from "../hooks/useAssignment"
import { mockUser } from "../fixtures/users"
import { act } from "react-dom/test-utils"
import { useSession } from "next-auth/client"
import { Team } from "@prisma/client"
import { Status } from "../types"

jest.mock("next-auth/client")

jest.mock("../hooks/useUsers")
;(useUsers as jest.Mock).mockReturnValue({
  data: [mockUser],
})

jest.mock("../hooks/useAssignment")
;(useAssignment as jest.Mock).mockReturnValue({
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

describe("AssignmentWidget", () => {
  describe("when user is in the pilot group", () => {
    beforeAll(() =>
      (useSession as jest.Mock).mockReturnValue([
        { user: { ...mockUser, inPilot: true } },
        false,
      ])
    )

    it("renders correctly when there is no one assigned", () => {
      render(<AssignmentWidget status={Status.InProgress} workflowId="123" />)

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
      render(<AssignmentWidget status={Status.InProgress} workflowId="123" />)
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
      render(<AssignmentWidget status={Status.InProgress} workflowId="123" />)

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
      ;(useAssignment as jest.Mock).mockReturnValue({
        data: {
          assignee: mockUser,
          assignedTeam: "Sensory",
        },
      })

      render(<AssignmentWidget status={Status.InProgress} workflowId="123" />)

      expect(
        screen.getByText("Assigned to Firstname Surname", { exact: false })
      ).toBeVisible()

      fireEvent.click(screen.getByText("Reassign"))

      expect(
        screen.getByDisplayValue(
          "Firstname Surname (firstname.surname@hackney.gov.uk)"
        )
      ).toBeVisible()
    })

    it("renders correctly when there a team but no person assigned", () => {
      ;(useAssignment as jest.Mock).mockReturnValue({
        data: {
          assignee: null,
          teamAssignedTo: Team.Access,
        },
      })

      render(<AssignmentWidget status={Status.InProgress} workflowId="123" />)

      expect(screen.getByText(/Assigned to Access team/)).toBeVisible()
      expect(screen.getByText("Reassign"))
    })

    it("only shows qam approvers if the workflow has been manager-approved already", () => {
      render(
        <AssignmentWidget status={Status.ManagerApproved} workflowId="123" />
      )

      fireEvent.click(screen.getByText("Reassign"))

      screen.debug()
      expect(screen.getAllByRole("option").length).toBe(7)
    })

    it("can un-assign a person and a team", async () => {
      ;(useAssignment as jest.Mock).mockReturnValue({
        data: {
          assignee: mockUser,
          assignedTeam: Team.Access,
        },
      })

      render(<AssignmentWidget status={Status.InProgress} workflowId="123" />)

      fireEvent.click(screen.getByText("Reassign"))
      fireEvent.change(screen.getByLabelText("Who is working on this?"), {
        target: { value: "Unassigned" },
      })
      fireEvent.change(screen.getByLabelText("Team"), {
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
  })

  describe("when user is not in the pilot group", () => {
    beforeAll(() =>
      (useSession as jest.Mock).mockReturnValue([
        { user: { ...mockUser, inPilot: false } },
        false,
      ])
    )

    it("doesn't allow assignment when there is no one assigned", () => {
      ;(useAssignment as jest.Mock).mockReturnValue({
        data: {
          assignee: null,
          teamAssignedTo: null,
        },
      })

      render(<AssignmentWidget status={Status.InProgress} workflowId="123" />)

      expect(screen.getByText("No one is assigned")).toBeVisible()
      expect(screen.queryByText("Assign someone?")).not.toBeInTheDocument()
    })

    it("doesn't allow assignment when someone is assigned", () => {
      ;(useAssignment as jest.Mock).mockReturnValue({
        data: {
          assignee: mockUser,
          assignedTeam: "Sensory",
        },
      })

      render(<AssignmentWidget status={Status.InProgress} workflowId="123" />)

      expect(screen.getByText("Assigned to Firstname Surname")).toBeVisible()
      expect(screen.queryByText("Reassign")).not.toBeInTheDocument()
    })

    it("doesn't allow assignment when there a team but no person assigned", () => {
      ;(useAssignment as jest.Mock).mockReturnValue({
        data: {
          assignee: null,
          teamAssignedTo: Team.Access,
        },
      })

      render(<AssignmentWidget status={Status.InProgress} workflowId="123" />)

      expect(screen.getByText(/Assigned to Access team/)).toBeVisible()
      expect(screen.queryByText("Reassign")).not.toBeInTheDocument()
    })
  })
})
