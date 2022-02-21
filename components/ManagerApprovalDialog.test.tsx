import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRouter } from "next/router"
import useUsers from "../hooks/useUsers"
import { mockWorkflow } from "../fixtures/workflows"
import { mockUser, mockPanelApprover } from "../fixtures/users"
import ManagerApprovalDialog from "./ManagerApprovalDialog"
import { mockNextStep } from "../fixtures/nextSteps"
import useNextSteps from "../hooks/useNextSteps"
import { mockNextStepOptions } from "../fixtures/nextStepOptions"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

jest.mock("../hooks/useUsers")
;(useUsers as jest.Mock).mockReturnValue({
  data: [mockPanelApprover],
})

jest.mock("../hooks/useNextSteps")
;(useNextSteps as jest.Mock).mockReturnValue({ data: mockNextStepOptions })

global.fetch = jest.fn()

document.head.insertAdjacentHTML(
  "afterbegin",
  '<meta http-equiv="XSRF-TOKEN" content="test" />'
)

const onDismiss = jest.fn()

const mockWorkflowWithoutQamNextSteps = {
  ...mockWorkflow,
  nextSteps: [
    {
      ...mockNextStep,
      id: "requires-manager-approval-only",
      nextStepOptionId: "email-and-workflow-on-approval",
    },
  ],
}

describe("when the dialog is initialised", () => {
  it("displays if open is true", () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    expect(screen.getByText("Approval")).toBeInTheDocument()
  })

  it("doesn't display if open is false", () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
        isOpen={false}
        onDismiss={onDismiss}
      />
    )

    expect(screen.queryByText("Approval")).not.toBeInTheDocument()
  })
})

describe("when the dialog is open by default", () => {
  it("calls the onDismiss if close is clicked", () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    fireEvent.click(screen.getByText("Close"))

    expect(onDismiss).toBeCalled()
  })

  it("displays comments box", () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    expect(screen.getByLabelText("Comments", { exact: false })).toBeVisible()
  })

  it("doesn't display dropdown for assigning a panel approver", () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    expect(
      screen.queryByText("Who should authorise this?")
    ).not.toBeInTheDocument()
  })

  it("doesn't display textbox for reason for edits", () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    expect(
      screen.queryByText("What needs to be changed?")
    ).not.toBeInTheDocument()
  })

  it("displays an error message if approval option isn't chosen", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
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

  it("doesn't display the QAM message", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    expect(
      screen.queryByText("This workflow must be sent for QAM")
    ).not.toBeInTheDocument()
  })
})

describe("when approve and send to QAM option is chosen", () => {
  it("displays dropdown of panel approvers", async () => {
    ;(useUsers as jest.Mock).mockReturnValue({
      data: [
        { ...mockUser, email: "not.an.approver@hackney.gov.uk" },
        { ...mockPanelApprover, email: "panel.approver1@hackney.gov.uk" },
        { ...mockPanelApprover, email: "panel.approver2@hackney.gov.uk" },
      ],
    })

    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    await waitFor(() =>
      fireEvent.click(screen.getByText("Yes, approve and send to QAM"))
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

  it("allows approval of a workflow with a comment", async () => {
    ;(useUsers as jest.Mock).mockReturnValue({
      data: [mockPanelApprover],
    })

    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    await waitFor(() => {
      fireEvent.click(screen.getByText("Yes, approve and send to QAM"))
      userEvent.selectOptions(
        screen.getByRole("combobox", {
          name: /Who should authorise this?/,
        }),
        [mockPanelApprover.email]
      )
      userEvent.type(
        screen.getByLabelText("Comments", { exact: false }),
        "Some comment"
      )
      fireEvent.click(screen.getByText("Submit"))
    })

    expect(fetch).toBeCalledWith("/api/workflows/123abc/approval", {
      method: "POST",
      body: JSON.stringify({
        action: "approve-with-qam",
        comment: "Some comment",
        panelApproverEmail: mockPanelApprover.email,
      }),
      headers: { "XSRF-TOKEN": "test" },
    })
  })

  it("allows approval of a workflow without a comment", async () => {
    ;(useUsers as jest.Mock).mockReturnValue({
      data: [mockPanelApprover],
    })

    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    await waitFor(() => {
      fireEvent.click(screen.getByText("Yes, approve and send to QAM"))
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
        comment: "",
        panelApproverEmail: mockPanelApprover.email,
      }),
      headers: { "XSRF-TOKEN": "test" },
    })
  })

  it("displays an error message if panel approver isn't assigned", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    await waitFor(() =>
      fireEvent.click(screen.getByText("Yes, approve and send to QAM"))
    )
    await waitFor(() => fireEvent.click(screen.getByText("Submit")))

    expect(
      screen.getByText("You must assign an authoriser")
    ).toBeInTheDocument()
  })
})

describe("when approve and skip QAM is chosen", () => {
  it("allows approval without QAM of a workflow with a comment", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    await waitFor(() => {
      fireEvent.click(screen.getByLabelText("Yes, approve—no QAM is needed"))
    })
    userEvent.type(
      screen.getByLabelText("Comments", { exact: false }),
      "Some comment"
    )
    await waitFor(() => {
      fireEvent.click(screen.getByText("Submit"))
    })

    expect(fetch).toBeCalledWith("/api/workflows/123abc/approval", {
      method: "POST",
      body: JSON.stringify({
        action: "approve-without-qam",
        comment: "Some comment",
        panelApproverEmail: "",
      }),
      headers: { "XSRF-TOKEN": "test" },
    })
  })

  it("allows approval without QAM of a workflow without a comment", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    await waitFor(() => {
      fireEvent.click(screen.getByLabelText("Yes, approve—no QAM is needed"))
    })
    await waitFor(() => {
      fireEvent.click(screen.getByText("Submit"))
    })

    expect(fetch).toBeCalledWith("/api/workflows/123abc/approval", {
      method: "POST",
      body: JSON.stringify({
        action: "approve-without-qam",
        comment: "",
        panelApproverEmail: "",
      }),
      headers: { "XSRF-TOKEN": "test" },
    })
  })
})

describe("when return for edits is chosen", () => {
  it("asks what needs to be changes instead of comments", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    fireEvent.click(screen.getByLabelText("No, return for edits"))

    await waitFor(() => {
      expect(
        screen.getByLabelText("What needs to be changed?", { exact: false })
      ).toBeVisible()
      expect(screen.queryByLabelText("Comments")).not.toBeInTheDocument()
    })
  })

  it("allows workflow to be returned for edits", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
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
          comment: "Example reason here",
          panelApproverEmail: "",
        }),
        headers: { "XSRF-TOKEN": "test" },
      })
    })
  })

  it("displays an error message if reason isn't provided", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithoutQamNextSteps}
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

describe("when a workflow has next steps that require QAM", () => {
  const mockWorkflowWithQamNextSteps = {
    ...mockWorkflow,
    nextSteps: [
      {
        ...mockNextStep,
        id: "requires-qam-approval",
        nextStepOptionId: "email-on-qam-approval",
      },
      {
        ...mockNextStep,
        id: "requires-manager-approval-only",
        nextStepOptionId: "email-and-workflow-on-approval",
      },
    ],
  }

  it("displays a message", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    expect(
      screen.queryByText("This workflow must be sent for QAM")
    ).toBeVisible()
  })

  it("displays the next steps requiring QAM", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    expect(screen.queryByText("Example next step")).not.toBeInTheDocument()
    expect(screen.queryByText("Example next step 4")).toBeVisible()
  })

  it("hides option to skip QAM", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflowWithQamNextSteps}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    expect(
      screen.queryByText("Yes, approve—no QAM is needed")
    ).not.toBeInTheDocument()
  })
})
