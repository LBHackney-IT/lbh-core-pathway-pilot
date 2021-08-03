import AssigneeWidget from "./AssigneeWidget"
import { render, screen, fireEvent } from "@testing-library/react"
import useUsers from "../hooks/useUsers"
import useAssignee from "../hooks/useAssignee"
import { mockUser } from "../fixtures/users"
import { act } from "react-dom/test-utils"
import { useSession } from "next-auth/client"

jest.mock("next-auth/client")
;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }, false])

jest.mock("../hooks/useUsers")
;(useUsers as jest.Mock).mockReturnValue({
  data: [mockUser],
})

jest.mock("../hooks/useAssignee")

global.fetch = jest.fn()

describe("AssigneeWidget", () => {
  it("renders correctly when there is no one assigned", () => {
    ;(useAssignee as jest.Mock).mockReturnValue({
      data: null,
    })

    render(<AssigneeWidget workflowId="123" />)
    expect(screen.getByText("No one is assigned", { exact: false }))
    fireEvent.click(screen.getByText("Assign someone?"))
    expect(screen.getByRole("heading"))
    expect(screen.getByRole("combobox"))
    expect(screen.getByDisplayValue("Unassigned"))
    expect(screen.getAllByRole("button").length).toBe(3)
  })

  it("renders correctly when someone is assigned", () => {
    ;(useAssignee as jest.Mock).mockReturnValue({
      data: mockUser,
    })

    render(<AssigneeWidget workflowId="123" />)
    expect(screen.getByText("Assigned to Firstname Surname", { exact: false }))
    fireEvent.click(screen.getByText("Reassign"))
    expect(
      screen.getByDisplayValue(
        "Firstname Surname (firstname.surname@hackney.gov.uk)"
      )
    )
  })

  it("can assign someone", async () => {
    ;(useAssignee as jest.Mock).mockReturnValue({
      data: null,
    })

    render(<AssigneeWidget workflowId="123" />)
    fireEvent.click(screen.getByText("Assign someone?"))
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "firstname.surname@hackney.gov.uk" },
    })
    await act(
      async () => await fireEvent.click(screen.getByText("Save changes"))
    )
    expect(fetch).toBeCalledWith("/api/workflows/123", {
      body: JSON.stringify({ assignedTo: "firstname.surname@hackney.gov.uk" }),
      method: "PATCH",
    })
  })

  it("can assign to me", async () => {
    ;(useAssignee as jest.Mock).mockReturnValue({
      data: null,
    })

    render(<AssigneeWidget workflowId="123" />)
    fireEvent.click(screen.getByText("Assign someone?"))
    await act(
      async () => await fireEvent.click(screen.getByText("Assign to me"))
    )
    expect(fetch).toBeCalledWith("/api/workflows/123", {
      body: JSON.stringify({ assignedTo: "firstname.surname@hackney.gov.uk" }),
      method: "PATCH",
    })
  })

  it("can re-assign someone", async () => {
    ;(useAssignee as jest.Mock).mockReturnValue({
      data: mockUser,
    })

    render(<AssigneeWidget workflowId="123" />)
    fireEvent.click(screen.getByText("Reassign"))
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Unassigned" },
    })
    await act(
      async () => await fireEvent.click(screen.getByText("Save changes"))
    )
    expect(fetch).toBeCalledWith("/api/workflows/123", {
      body: JSON.stringify({ assignedTo: null }),
      method: "PATCH",
    })
  })
})
