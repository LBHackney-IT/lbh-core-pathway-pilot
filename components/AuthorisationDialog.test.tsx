import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/router"
import { mockWorkflow } from "../fixtures/workflows"
import AuthorisationDialog from "./AuthorisationDialog"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
})

global.fetch = jest.fn()

document.head.insertAdjacentHTML(
  "afterbegin",
  '<meta http-equiv="XSRF-TOKEN" content="test" />'
)

const onDismiss = jest.fn()

describe("AuthorisationDialog", () => {
  it("displays if open is true", () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    expect(screen.getByText("Quality assurance meeting")).toBeInTheDocument()
  })

  it("doesn't display if open is false", () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={false}
        onDismiss={onDismiss}
      />
    )

    expect(
      screen.queryByText("Quality assurance meeting")
    ).not.toBeInTheDocument()
  })

  it("calls the onDismiss if close is clicked", () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    fireEvent.click(screen.getByText("Close"))

    expect(onDismiss).toBeCalled()
  })

  it("authorises workflow", async () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    fireEvent.click(screen.getByText("Yes, it has been authorised"))
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(fetch).toBeCalledWith("/api/workflows/123abc/approval", {
        method: "POST",
        body: expect.anything(),
        headers: { "XSRF-TOKEN": "test" },
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
    )

    expect(
      screen.queryByText("What needs to be changed?")
    ).not.toBeInTheDocument()
  })

  it("allows workflow to be returned for edits", async () => {
    render(
      <AuthorisationDialog
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
          comment: "Example reason here",
        }),
        headers: { "XSRF-TOKEN": "test" },
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
      screen.getByText(
        "You must choose whether to authorise or return this work"
      )
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

  it("displays a link to tasklist page to allow for minor edits", async () => {
    render(
      <AuthorisationDialog
        workflow={mockWorkflow}
        isOpen={true}
        onDismiss={onDismiss}
      />
    )

    expect(screen.getByText("make minor edits")).toHaveAttribute(
      "href",
      `/workflows/${mockWorkflow.id}/steps`
    )
    expect(screen.getByText("make minor edits").closest("p")).toHaveTextContent(
      "You can make minor edits yourself."
    )
  })
})
