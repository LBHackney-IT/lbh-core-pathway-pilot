import { fireEvent, render, screen } from "@testing-library/react"
import { useRouter } from "next/router"
import useQuery from "./useQueryState"

jest.mock("next/router")
useRouter as jest.Mock
;(useRouter as jest.Mock).mockReturnValue({
  replace: jest.fn(),
  query: {},
})

beforeEach(() => {
  jest.clearAllMocks()
})

const MockComponent = () => {
  const [state, setState] = useQuery("foo", "bar")
  return (
    <>
      <button onClick={() => setState("der")} />
      <p>{state}</p>
    </>
  )
}

describe("useWarnUnsavedChanges", () => {
  it("sets an initial value if one isn't in the query", () => {
    render(<MockComponent />)
    expect(screen.getByText("bar"))
  })

  it("updates state locally and in the url", () => {
    render(<MockComponent />)
    fireEvent.click(screen.getByRole("button"))
    expect(screen.getByText("der"))
    expect(useRouter().replace).toBeCalledWith("http://localhost/?foo=der")
  })

  it("can restore an initial value from the query", () => {
    ;(useRouter as jest.Mock).mockReturnValue({
      replace: jest.fn(),
      query: {
        foo: "test value",
      },
    })

    render(<MockComponent />)
    expect(screen.getByText("test value"))
  })
})
