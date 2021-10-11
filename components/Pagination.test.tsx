import { render, screen } from "@testing-library/react"
import Pagination from "./Pagination"

describe("Pagination", () => {
  it("doesn't show previous button on the first page", () => {
    render(<Pagination currentPage={1} />)
    expect(screen.queryByText("Previous")).toBeNull()
    render(<Pagination currentPage={2} />)
    expect(screen.getByText("Previous"))
  })
})
