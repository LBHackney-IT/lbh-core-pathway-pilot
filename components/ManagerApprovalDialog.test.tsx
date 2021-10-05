import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRouter } from "next/router"
import useUsers from "../hooks/useUsers"
import { mockWorkflow } from "../fixtures/workflows"
import { mockUser, mockPanelApprover } from "../fixtures/users"
import ManagerApprovalDialog from "./ManagerApprovalDialog"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

jest.mock("../hooks/useUsers")
;(useUsers as jest.Mock).mockReturnValue({
  data: [mockPanelApprover],
})

global.fetch = jest.fn()

const onDismiss = jest.fn()

describe("ManagerApprovalDialog", () => {
  it("allows approval without qam of a workflow", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    await waitFor(() => {
      fireEvent.click(
        screen.getByLabelText("Yes, approve—no quality assurance is needed")
      )
    })
    await waitFor(() => {
      fireEvent.click(screen.getByText("Submit"))
    })

    expect(fetch).toBeCalledWith("/api/workflows/123abc/approval", {
      method: "POST",
      body: JSON.stringify({
        action: "approve-without-qam",
        reason: "",
        panelApproverEmail: "",
      }),
    })
  })

  it("displays if open is true", () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    expect(screen.getByText("Approval")).toBeInTheDocument()
  })

  it("doesn't display if open is false", () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflow}
        isOpen={false}
        onDismiss={onDismiss}
      />
    )

    expect(screen.queryByText("Approval")).not.toBeInTheDocument()
  })

  it("calls the onDismiss if close is clicked", () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    fireEvent.click(screen.getByText("Close"))

    expect(onDismiss).toBeCalled()
  })

  it("displays dropdown of panel approvers if yes chosen", async () => {
    ;(useUsers as jest.Mock).mockReturnValue({
      data: [
        { ...mockUser, email: "not.an.approver@hackney.gov.uk" },
        { ...mockPanelApprover, email: "panel.approver1@hackney.gov.uk" },
        { ...mockPanelApprover, email: "panel.approver2@hackney.gov.uk" },
      ],
    })

    render(
      <ManagerApprovalDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    await waitFor(() =>
      fireEvent.click(
        screen.getByText("Yes, approve and send for quality assurance")
      )
    )

    const dropdown = screen.getByRole("combobox", {
      name: /Who should authorise this?/,
    })
    const dropdownOptions = dropdown.childNodes

    expect(dropdown).toBeInTheDocument()
    expect(dropdownOptions).toHaveLength(3)
    expect(dropdownOptions[0]).toHaveValue("")
    expect(dropdownOptions[1]).toHaveValue("panel.approver1@hackney.gov.uk")
    expect(dropdownOptions[2]).toHaveValue("panel.approver2@hackney.gov.uk")
  })

  it("doesn't display dropdown for assigning a panel approver by default", () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    expect(
      screen.queryByText("Who should authorise this?")
    ).not.toBeInTheDocument()
  })

  it("allows approval of a workflow", async () => {
    ;(useUsers as jest.Mock).mockReturnValue({
      data: [mockPanelApprover],
    })

    render(
      <ManagerApprovalDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    await waitFor(() => {
      fireEvent.click(
        screen.getByText("Yes, approve and send for quality assurance")
      )
      userEvent.selectOptions(
        screen.getByRole("combobox", {
          name: /Who should authorise this?/,
        }),
        [mockPanelApprover.email]
      )
      fireEvent.click(screen.getByText("Submit"))
    })

    expect(fetch).toBeCalledWith("/api/workflows/123abc/approval", {
      method: "POST",
      body: JSON.stringify({
        action: "approve-with-qam",
        reason: "",
        panelApproverEmail: mockPanelApprover.email,
      }),
    })
  })

  it("doesn't display textbox for reason for edits by default", () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    expect(
      screen.queryByText("What needs to be changed?")
    ).not.toBeInTheDocument()
  })

  it("allows workflow to be returned for edits", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    fireEvent.click(screen.getByLabelText("No, return for edits"))
    fireEvent.change(
      screen.getByLabelText("What needs to be changed?", { exact: false }),
      {
        target: { value: "Example reason here" },
      }
    )
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(fetch).toBeCalledWith("/api/workflows/123abc/approval", {
        method: "DELETE",
        body: JSON.stringify({
          action: "return",
          reason: "Example reason here",
          panelApproverEmail: "",
        }),
      })
    })
  })

  it("displays an error message if approval option isn't chosen", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    await waitFor(() => {
      fireEvent.click(screen.getByText("Submit"))
    })

    expect(
      screen.getByText("You must choose whether to approve or return this work")
    ).toBeInTheDocument()
  })

  it("displays an error message if yes is chosen and panel approver isn't assigned", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    await waitFor(() =>
      fireEvent.click(
        screen.getByText("Yes, approve and send for quality assurance")
      )
    )
    await waitFor(() => fireEvent.click(screen.getByText("Submit")))

    expect(
      screen.getByText("You must assign an authoriser")
    ).toBeInTheDocument()
  })

  it("displays an error message if no is chosen and reason isn't provided", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    await waitFor(() =>
      fireEvent.click(screen.getByText("No, return for edits"))
    )
    await waitFor(() => fireEvent.click(screen.getByText("Submit")))

    expect(screen.getByText("You must give a reason")).toBeInTheDocument()
  })
})
