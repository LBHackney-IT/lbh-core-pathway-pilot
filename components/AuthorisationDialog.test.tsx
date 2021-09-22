import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/router"
import { mockWorkflow } from "../fixtures/workflows"
import { FinanceType } from "@prisma/client"
import AuthorisationDialog from "./AuthorisationDialog"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

const onDismiss = jest.fn();

describe("AuthorisationDialog", () => {
  it("displays if open is true", () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    expect(screen.getByText("Panel authorisation")).toBeInTheDocument()
  })

  it("doesn't display if open is false", () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={false}
        onDismiss={onDismiss}
      />
    )

    expect(screen.queryByText("Panel authorisation")).not.toBeInTheDocument()
  })

  it('calls the onDismiss if close is clicked', () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByText('Close'));

    expect(onDismiss).toBeCalled();
  });

  it("sends workflow to brokerage", async () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByText("Yes, send to brokerage"))
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(fetch).toBeCalledWith("/api/workflows/123abc/approval", {
        method: "POST",
        body: JSON.stringify({
          sentTo: FinanceType.Brokerage,
        }),
      })
    })
  })

  it("sends workflow to direct payments", async () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByText("Yes, send to direct payments"))
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(fetch).toBeCalledWith("/api/workflows/123abc/approval", {
        method: "POST",
        body: JSON.stringify({
          sentTo: FinanceType.DirectPayments,
        }),
      })
    })
  })

  it("doesn't display textbox for reason for edits by default", () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    );

    expect(screen.queryByText("What needs to be changed?")).not.toBeInTheDocument()
  })

  it("allows workflow to be returned for edits", async () => {
    render(
      <AuthorisationDialog
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
          reason: "Example reason here",
        }),
      })
    })
  })

  it("displays an error message if approval option isn't chosen", async () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    await waitFor(() => {
      fireEvent.click(screen.getByText("Submit"))
    })

    expect(
      screen.getByText("You must choose whether to authorise or return this work")
    ).toBeInTheDocument()
  })

  it("displays an error message if no is chosen and reason isn't provided", async () => {
    render(
      <AuthorisationDialog
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
