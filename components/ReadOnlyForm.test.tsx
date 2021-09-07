import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { mockForm } from "../fixtures/form"
import ReadOnlyForm from "./ReadOnlyForm"

describe("ReadOnlyForm", () => {
  it("can be expanded and collapsed", async () => {
    render(<ReadOnlyForm fields={mockForm.themes[0].steps[0].fields} />)

    expect(screen.getByRole("button"))
    fireEvent.click(screen.getByText("Expand previous answers"))
    await waitFor(() => {
      fireEvent.click(screen.getByText("Collapse previous answers"))
    })
  })
})
