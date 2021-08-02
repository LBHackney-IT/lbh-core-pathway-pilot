import StepForm from "./StepForm"
import { Field } from "../../types"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"

const mockPush = jest.fn()

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useRouter = jest.spyOn(require("next/router"), "useRouter")

useRouter.mockImplementation(() => ({
  push: mockPush,
  query: {
    id: "foo",
  },
  events: {
    on: jest.fn(),
    off: jest.fn(),
  },
}))

const mockFields = [
  {
    id: "one",
    question: "Test question",
    required: true,
    type: "text",
  },
] as Field[]

describe("StepForm", () => {
  it("renders the correct fields", () => {
    render(
      <StepForm
        fields={mockFields}
        onSubmit={(values, { setStatus }) =>
          setStatus("Example status message")
        }
      />
    )

    expect(screen.getByTestId("one")).toHaveTextContent("Test question")
    expect(screen.getByText("Save and continue"))
  })

  it("shows an error if submission fails", async () => {
    render(
      <StepForm
        fields={mockFields}
        onSubmit={(values, { setStatus }) =>
          setStatus("Example status message")
        }
      />
    )

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "test value" },
    })
    fireEvent.click(screen.getByText("Save and continue"))

    await waitFor(() => {
      expect(screen.getByText("Example status message"))
      expect(mockPush).toBeCalledTimes(0)
    })
  })

  it("returns to the task list if submission succeeds", async () => {
    render(<StepForm fields={mockFields} onSubmit={() => true} />)

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "test value" },
    })
    fireEvent.click(screen.getByText("Save and continue"))

    await waitFor(() => {
      expect(mockPush).toBeCalled()
      expect(mockPush).toBeCalledWith(`/workflows/foo`)
    })
  })
})
