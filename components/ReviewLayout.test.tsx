import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useSession } from "next-auth/client"
import { mockForm } from "../fixtures/form"
import { mockResident } from "../fixtures/residents"
import { mockUser } from "../fixtures/users"
import {
  MockWorkflowWithExtras,
  mockWorkflowWithExtras,
} from "../fixtures/workflows"
import useResident from "../hooks/useResident"
import ReviewOverviewLayout from "./ReviewLayout"

jest.mock("next-auth/client")
;(useSession as jest.Mock).mockReturnValue([{ user: mockUser }, false])

jest.mock("../hooks/useResident")
;(useResident as jest.Mock).mockReturnValue({
  data: mockResident,
})

global.fetch = jest.fn()

const mockWorkflow: MockWorkflowWithExtras = {
  ...mockWorkflowWithExtras,
  //   new answers
  answers: {},
  previousReview: {
    ...mockWorkflowWithExtras,
    // old answers
    answers: {
      "mock-step": {
        "mock-question": "test",
      },
    },
  },
}

describe("ReviewLayout", () => {
  it("shows information about the thing being reviewed", async () => {
    render(
      <ReviewOverviewLayout
        workflow={mockWorkflow}
        step={mockWorkflow.form.themes[0].steps[0]}
      />
    )
    await waitFor(() => {
      expect(screen.getByText(mockForm.name, { exact: false }))
      expect(screen.getByText("Last reviewed 13 Oct 2020", { exact: false }))
    })
  })

  it("shows an editable and read-only version of each field", async () => {
    render(
      <ReviewOverviewLayout
        workflow={mockWorkflow}
        step={mockWorkflow.form.themes[0].steps[0]}
      />
    )
    await waitFor(() => {
      expect(screen.getAllByLabelText("Mock question?").length).toBe(2)
      expect(screen.getAllByLabelText("Mock question?")[0]).toBeDisabled()
      expect(screen.getAllByLabelText("Mock question?")[1]).not.toBeDisabled()
    })
  })

  it("can copy answers from the old to the new version", async () => {
    render(
      <ReviewOverviewLayout
        workflow={mockWorkflow}
        step={mockWorkflow.form.themes[0].steps[0]}
      />
    )
    expect(screen.getAllByDisplayValue("test").length).toBe(1)
    fireEvent.click(screen.getByText("Copy all answers"))
    await waitFor(() =>
      expect(screen.getAllByDisplayValue("test").length).toBe(2)
    )
  })
})
