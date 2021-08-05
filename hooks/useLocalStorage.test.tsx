import { fireEvent, render, screen } from "@testing-library/react"
import useLocalStorage from "./useLocalStorage"

beforeAll(() => {
  global.Storage.prototype.setItem = jest.fn(() => true)
  global.Storage.prototype.getItem = jest.fn(() => "")
})

beforeEach(() => {
  jest.clearAllMocks()
})

const MockComponent = () => {
  const [state, setState] = useLocalStorage("foo", "bar")
  return (
    <>
      <button onClick={() => setState("der")} />
      <p>{state}</p>
    </>
  )
}

describe("useLocalStorage", () => {
  it("sets an initial value if one isn't stored", () => {
    render(<MockComponent />)
    expect(screen.getByText("bar"))
    expect(global.Storage.prototype.getItem).toBeCalledWith("foo")
  })

  it("updates state in localstorage", () => {
    render(<MockComponent />)
    fireEvent.click(screen.getByRole("button"))
    expect(global.Storage.prototype.setItem).toBeCalledWith(
      "foo",
      JSON.stringify("der")
    )
    expect(screen.getByText("der"))
  })

  it("can restore an initial value from localstorage", async () => {
    ;(global.Storage.prototype.getItem as jest.Mock).mockReturnValue(
      JSON.stringify("test value")
    )

    render(<MockComponent />)
    expect(screen.getByText("test value"))
  })
})
