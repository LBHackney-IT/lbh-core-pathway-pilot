import ResidentWidget from "./ResidentWidget"
import { render, screen } from "@testing-library/react"
import { mockResident } from "../fixtures/residents"
import swr from "swr"
import {beforeEach} from "@jest/globals";

jest.mock("swr")
;(swr as jest.Mock).mockReturnValue({
  data: mockResident,
})

describe("components/ResidentWidget", () => {
  beforeEach(() => {
    render(
      <ResidentWidget socialCareId={mockResident.mosaicId} />
    )
  })

  it("calls the hook correctly", () => {
    expect(swr).toBeCalledWith(`/api/residents/${mockResident.mosaicId}`);
  });

  it("renders correctly when there is a person", () => {
    expect(screen.getByText(`${mockResident.firstName} ${mockResident.lastName}`))
    expect(screen.getByText("Born 1 Oct 2000"))
    expect(screen.queryByText("123 Town St"))
    expect(screen.queryByText("W1A"))
  });

  describe('when the date of birth is missing', () => {
    beforeEach(() => {
      ;(swr as jest.Mock).mockReturnValue({
        data: {
          ...mockResident,
          dateOfBirth: null,
        },
      })

      render(
        <ResidentWidget socialCareId={mockResident.mosaicId} />
      )
    });

    it("does not display dob field", () => {
      expect(screen.queryByText("Born")).toBeNull();
    })
  });

})
