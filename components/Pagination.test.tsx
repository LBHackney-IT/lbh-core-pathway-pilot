import { render, screen } from "@testing-library/react"
import Pagination from "./Pagination"

describe("Pagination", () => {
  describe('the first page of results', () => {
    it("does not show previous button", () => {
      render(<Pagination currentPage={1} totalWorkflows={1} />)
      expect(screen.queryByText("Previous")).toBeNull()
    });
  });

  describe('the second page of results', () => {
    it('shows the previous button', () => {
      render(<Pagination currentPage={2} totalWorkflows={200} />)
      expect(screen.getByText("Previous"))
    })
  })
})
