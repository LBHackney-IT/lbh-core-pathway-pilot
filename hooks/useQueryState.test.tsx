import {fireEvent, render, screen, waitFor} from "@testing-library/react"
import useQueryState from "./useQueryState"
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

const MockComponent2 = () => {
  const [state, setState] = useQueryState<string>("foo", "bar")
  return (
    <>
      <button onClick={() => setState("")} />
      <p>{state}</p>
    </>
  )
}

const MockComponentDeleteParams = () => {
  const [foo, setFoo] = useQueryState<string>("foo", "one", ['bar'])
  const [bar, setBar] = useQueryState<string>("bar", "two")

  return (
    <>
      <button onClick={() => setFoo("three")}>foo</button>
      <p>{foo}</p>
      <button onClick={() => setBar("four")}>bar</button>
      <p>{bar}</p>
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
    expect(mockReplace).toBeCalledWith("foobar?foo=der", undefined, {
      scroll: false,
    })
  })

  it("can restore an initial value from the url", async () => {
    window.location.search = "?foo=test"
    render(<MockComponent />)
    expect(screen.getByText("test"))
  })

  it("doesn't update the url if there is nothing to update", () => {
    window.location.search = "?foo=der"
    render(<MockComponent />)
    fireEvent.click(screen.getByRole("button"))
    expect(mockReplace).not.toBeCalled()
  })

  it("cleans falsy values out from the url", () => {
    render(<MockComponent2 />)
    fireEvent.click(screen.getByRole("button"))
    expect(mockReplace).toBeCalledWith("foobar?", undefined, {
      scroll: false,
    })
  })

  it("deletes intended params from the url", async () => {
    window.location = {
      origin: "foo",
      pathname: "bar",
      search: "?bar=four",
    } as Location

    render(<MockComponentDeleteParams />)

    fireEvent.click(screen.getByText("foo"));
    expect(mockReplace).toBeCalledWith("foobar?foo=three", undefined, {
      scroll: false,
    })
  })
})
