import PrintableForm from "./PrintableWorkflow"
import { render, screen } from "@testing-library/react"
import { Form } from "../types"
import { mockForm } from "../fixtures/form"

describe("PrintableForm", () => {
  it("renders steps and questions", () => {
    render(<PrintableForm form={mockForm} />)

    expect(screen.getByText("Mock form name"))
    expect(screen.getByText("1. Foo step"))
    expect(screen.getByText("2. Bar step"))
    expect(screen.getByText("Foo question", { exact: false }))
    expect(screen.getByText("Bar question"))
    expect(screen.getAllByText("Choose all that apply").length).toBe(1)
  })

  it("properly marks required questions", () => {
    render(<PrintableForm form={mockForm} />)

    expect(screen.getByText("Foo question*"))
  })

  it("adds the right prompts for single and multiple selects", () => {
    render(<PrintableForm form={mockForm} />)

    expect(screen.getAllByText("Choose all that apply").length).toBe(1)
    expect(screen.getAllByText("Choose one").length).toBe(1)
  })
})
