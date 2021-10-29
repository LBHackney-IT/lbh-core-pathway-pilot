import { fireEvent, render, screen } from "@testing-library/react"
import useQueryParams from "./useQueryParams"
import { useRouter } from "next/router"

const mockReplace = jest.fn()

jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  replace: mockReplace,
})

beforeEach(() => {
  jest.clearAllMocks()

  delete window.location
  window.location = {
    origin: "example.com",
    pathname: "/path",
    search: "",
  } as Location
})

const MockComponent = () => {
  const [queryParams, updateQueryParams] = useQueryParams({ param: "initial" })

  return (
    <>
      <button onClick={() => updateQueryParams({ param: "updated" })} />
      <p>{queryParams["param"]}</p>
    </>
  )
}

describe("useQueryParams", () => {
  it("sets an initial value", () => {
    render(<MockComponent />)

    expect(screen.getByText("initial"))
  })

  it("updates parameters in the URL", () => {
    render(<MockComponent />)

    fireEvent.click(screen.getByRole("button"))

    expect(screen.getByText("updated"))
    expect(mockReplace).toBeCalledWith(
      "example.com/path?param=updated",
      undefined,
      {
        scroll: false,
      }
    )
  })

  it("restores an initial value from the URL over initial value", async () => {
    window.location.search = "?param=restored"

    render(<MockComponent />)

    expect(screen.getByText("restored"))
  })

  it("doesn't update the URL if there is nothing to update", () => {
    window.location.search = "?param=updated"

    render(<MockComponent />)

    fireEvent.click(screen.getByRole("button"))

    expect(mockReplace).not.toBeCalled()
  })
})
