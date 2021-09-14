import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/router"
import { mockWorkflow } from "../fixtures/workflows"
import ManagerApprovalDialog from "./ManagerApprovalDialog"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

const onDismiss = jest.fn();

describe("ManagerApprovalDialog", () => {
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

  it('calls the onDismiss if close is clicked', () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByText('Close'));

    expect(onDismiss).toBeCalled();
  });

  it("allows approval of a workflow", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByText("Yes, approve and send to panel"))
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(fetch).toBeCalledWith("/api/workflows/123abc/approval", {
        method: "POST",
        body: JSON.stringify({
          action: "approve",
          reason: "",
        }),
      })
    })
  })

  it("allows workflow to be returned for edits", async () => {
    render(
      <ManagerApprovalDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    );

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
        }),
      })
    })
  })
})
