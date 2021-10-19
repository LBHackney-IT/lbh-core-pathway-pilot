import { render, screen } from "@testing-library/react"
import Pagination from "./Pagination"
import { useRouter } from "next/router"
import useQueryState from "../hooks/useQueryState"

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
  replace: jest.fn(),
})

jest.mock("../hooks/useQueryState")

describe("Pagination", () => {
  describe("previous button", () => {
    it("does not show previous button on first page of results", () => {
      ;(useQueryState as jest.Mock).mockReturnValue([0, jest.fn()])

      render(<Pagination total={200} />)
      expect(screen.queryByText("Previous")).toBeNull()
    })

    it("shows the previous button on subsequent pages", async () => {
      ;(useQueryState as jest.Mock).mockReturnValue([2, jest.fn()])

      render(<Pagination total={200} />)
      expect(screen.getByText("Previous"))
    })
  })

  describe("next button", () => {
    it("does not show next button on last page of results", () => {
      ;(useQueryState as jest.Mock).mockReturnValue([1, jest.fn()])

      render(<Pagination total={28} />)
      expect(screen.queryByText("Next")).toBeNull()
    })

    it("shows the next button on first page of results", async () => {
      ;(useQueryState as jest.Mock).mockReturnValue([0, jest.fn()])

      render(<Pagination total={200} />)
      expect(screen.getByText("Next"))
    })
  })

  describe("page number", () => {
    it("shows the correct number on page 1", () => {
      ;(useQueryState as jest.Mock).mockReturnValue([0, jest.fn()])

      render(<Pagination total={28} />)
      expect(screen.getByLabelText("Page 1, current page"))
    })

    it("shows the correct number on page 20", () => {
      ;(useQueryState as jest.Mock).mockReturnValue([19, jest.fn()])

      render(<Pagination total={300} />)
      expect(screen.getByLabelText("Page 20, current page"))
    })
  })

  describe("info text", () => {
    it("shows the correct number on page 1", () => {
      ;(useQueryState as jest.Mock).mockReturnValue([0, jest.fn()])

      render(<Pagination total={28} />)
      expect(screen.getByText("Showing 1 - 20 of 28 results"))
    })

    it("shows the correct number on page 2", () => {
      ;(useQueryState as jest.Mock).mockReturnValue([1, jest.fn()])

      render(<Pagination total={40} />)
      expect(screen.getByText("Showing 21 - 40 of 40 results"))
    })
  })

  describe("when there is no need for pagination", () => {
    it("does not render the paginator", () => {
      ;(useQueryState as jest.Mock).mockReturnValue([0, jest.fn()])

      render(<Pagination total={10} />)
      expect(screen.queryByText("Previous")).toBeNull()
      expect(screen.queryByText("Next")).toBeNull()
    })
  })

  describe("surrounding page numbers", () => {
    it("shows the correct numbers on page 1", () => {
      ;(useQueryState as jest.Mock).mockReturnValue([0, jest.fn()])

      render(<Pagination total={300} />)
      expect(screen.getByText("2"))
      expect(screen.getByText("3"))
      expect(screen.getByText("4"))
    })

    it("shows the correct numbers on page 10", () => {
      ;(useQueryState as jest.Mock).mockReturnValue([9, jest.fn()])

      render(<Pagination total={300} />)

      expect(screen.getByText("11"))
      expect(screen.getByText("12"))
      expect(screen.getByText("13"))

      expect(screen.getByText("9"))
      expect(screen.getByText("8"))
      expect(screen.getByText("7"))
    })

    it("shows the correct numbers on page 20", () => {
      ;(useQueryState as jest.Mock).mockReturnValue([19, jest.fn()])

      render(<Pagination total={300} />)
      expect(screen.getByText("19"))
      expect(screen.getByText("18"))
      expect(screen.getByText("17"))
    })
  })
})
