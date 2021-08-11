import AssignmentWidget from "./AssignmentWidget"
import { render, screen, fireEvent } from "@testing-library/react"
import useUsers from "../hooks/useUsers"
import useAssignment from "../hooks/useAssignment"
import { mockUser } from "../fixtures/users"
import { act } from "react-dom/test-utils"
import { useSession } from "next-auth/client"

jest.mock("next-auth/client")
;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }, false])

jest.mock("../hooks/useUsers")
;(useUsers as jest.Mock).mockReturnValue({
  data: [mockUser],
})

jest.mock("../hooks/useAssignment")
;(useAssignment as jest.Mock).mockReturnValue({
  data: {
    assignee: null,
    // assignedTeam: null,
  },
})

global.fetch = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

describe("AssignmentWidget", () => {
  it("renders correctly when there is no one assigned", () => {
    render(<AssignmentWidget workflowId="123" />)
    expect(screen.getByText("No one is assigned", { exact: false }))
    fireEvent.click(screen.getByText("Assign someone?"))
    expect(screen.getByRole("heading"))
    expect(screen.getAllByRole("combobox").length).toBe(1)
    expect(screen.getAllByDisplayValue("Unassigned").length).toBe(1)
    expect(screen.getAllByRole("button").length).toBe(3)
  })

  it("can assign a person", async () => {
    render(<AssignmentWidget workflowId="123" />)
    fireEvent.click(screen.getByText("Assign someone?"))
    // fireEvent.change(screen.getAllByRole("combobox")[0], {
    //   target: { value: "Sensory" },
    // })
    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "firstname.surname@hackney.gov.uk" },
    })
    await act(
      async () => await fireEvent.click(screen.getByText("Save changes"))
    )
    expect(fetch).toBeCalledWith("/api/workflows/123", {
      body: JSON.stringify({
        assignedTo: "firstname.surname@hackney.gov.uk",
        // assignedTeam: "Sensory",
      }),
      method: "PATCH",
    })
  })

  it("can assign to me", async () => {
    render(<AssignmentWidget workflowId="123" />)
    fireEvent.click(screen.getByText("Assign someone?"))
    await act(
      async () => await fireEvent.click(screen.getByText("Assign to me"))
    )
    expect(fetch).toBeCalledWith("/api/workflows/123", {
      body: JSON.stringify({
        assignedTo: "firstname.surname@hackney.gov.uk",
        // assignedTeam: null,
      }),
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

    render(<AssignmentWidget workflowId="123" />)
    expect(screen.getByText("Assigned to Firstname Surname", { exact: false }))
    fireEvent.click(screen.getByText("Reassign"))
    expect(
      screen.getByDisplayValue(
        "Firstname Surname (firstname.surname@hackney.gov.uk)"
      )
    )
  })

  // it("renders correctly when there a team but no person assigned", () => {
  //   ;(useAssignment as jest.Mock).mockReturnValue({
  //     data: {
  //       assignee: null,
  //       assignedTeam: "foo",
  //     },
  //   })
  //   render(<AssignmentWidget workflowId="123" />)
  //   expect(screen.getByText("Assigned to foo", { exact: false }))
  //   expect(screen.getByText("Reassign"))
  // })

  it("can un-assign a person", async () => {
    ;(useAssignment as jest.Mock).mockReturnValue({
      data: {
        assignee: mockUser,
        // assignedTeam: "Sensory",
      },
    })

    render(<AssignmentWidget workflowId="123" />)
    fireEvent.click(screen.getByText("Reassign"))
    fireEvent.change(
      screen.getByLabelText("Who is working on this right now?"),
      {
        target: { value: "Unassigned" },
      }
    )
    // fireEvent.change(screen.getByLabelText("Team"), {
    //   target: { value: "Unassigned" },
    // })
    await act(
      async () => await fireEvent.click(screen.getByText("Save changes"))
    )
    expect(fetch).toBeCalledWith("/api/workflows/123", {
      body: JSON.stringify({
        assignedTo: null,
        // assignedTeam: null
      }),
      method: "PATCH",
    })
  })
})
