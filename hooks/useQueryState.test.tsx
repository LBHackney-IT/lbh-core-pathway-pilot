import { fireEvent, render, screen } from "@testing-library/react"
import useQueryState from "./useQueryState"
import { useRouter } from "next/router"

const mockPush = jest.fn()
jest.mock("next/router")
;(useRouter as jest.Mock).mockReturnValue({
  push: mockPush,
})

beforeEach(() => {
  delete window.location
  window.location = {
    origin: "foo",
    pathname: "bar",
    search: "",
  } as Location
})

const MockComponent = () => {
  const [state, setState] = useQueryState<string>("foo", "bar")
  return (
    <>
      <button onClick={() => setState("der")} />
      <p>{state}</p>
    </>
  )
}

describe("useQueryState", () => {
  it("sets an initial value if one isn't stored", () => {
    render(<MockComponent />)
    expect(screen.getByText("bar"))
  })

  it("updates state in the url", () => {
    render(<MockComponent />)
    fireEvent.click(screen.getByRole("button"))
    expect(screen.getByText("der"))
    expect(mockPush).toBeCalledWith("foobar?foo=der", undefined, {
      scroll: false,
    })
  })

  it("can restore an initial value from the url", async () => {
    window.location.search = "?foo=test"
    render(<MockComponent />)
    expect(screen.getByText("test"))
  })
})
