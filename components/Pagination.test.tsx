import {render, screen} from "@testing-library/react"
import Pagination from "./Pagination"
import {useRouter} from "next/router";
import useQueryState from "../hooks/useQueryState";

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: jest.fn(),
  replace: jest.fn(),
})

jest.mock("../hooks/useQueryState");

describe("Pagination", () => {
  describe('previous button', () => {
    it("does not show previous button on first page of results", () => {
      ;(useQueryState as jest.Mock).mockReturnValue([0, jest.fn()]);

      render(<Pagination total={200} />)
      expect(screen.queryByText("Previous")).toBeNull()
    });

    it('shows the previous button on subsequent pages', async () => {
      ;(useQueryState as jest.Mock).mockReturnValue([2, jest.fn()]);

      render(<Pagination total={200} />);
      expect(screen.getByText("Previous"))
    })
  });

  describe('next button', () => {
    it("does not show next button on last page of results", () => {
      ;(useQueryState as jest.Mock).mockReturnValue([1, jest.fn()]);

      render(<Pagination total={28} />)
      expect(screen.queryByText("Next")).toBeNull()
    });

    it('shows the next button on first page of results', async () => {
      ;(useQueryState as jest.Mock).mockReturnValue([0, jest.fn()]);

      render(<Pagination total={200} />);
      expect(screen.getByText("Next"))
    })
  })
})
