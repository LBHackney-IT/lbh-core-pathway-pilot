import { render, screen } from "@testing-library/react"
import AnswerFilters from "./AnswerFilters"

const mockSetFilter = jest.fn()

describe("AnswerFilters", () => {
  it("renders nothing on an incompatible form", () => {
    render(
      <AnswerFilters filter="" setFilter={mockSetFilter} formId="foo-form" />
    )

    expect(screen.queryByText("Filter answers:")).toBeNull()
  })

  it("renders radio options if a compatible form id is given", () => {
    render(
      <AnswerFilters
        filter=""
        setFilter={mockSetFilter}
        formId="care-act-assessment"
      />
    )

    expect(screen.getAllByRole("radio").length).toBe(2)
    expect(screen.getByText("All"))
    expect(screen.getByText("Direct payments"))
  })

  it("shows the right one as selected", () => {
    render(
      <AnswerFilters
        filter=""
        setFilter={mockSetFilter}
        formId="care-act-assessment"
      />
    )

    expect(screen.getAllByRole("radio")[0]).toBeChecked()
  })
})
