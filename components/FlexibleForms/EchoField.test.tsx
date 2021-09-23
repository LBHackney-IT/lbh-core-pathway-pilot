import { render, screen } from "@testing-library/react"
import EchoField from "./EchoField"

describe("EchoField", () => {
  it(" displays an answer based on the supplied path", () => {
    render(
      <EchoField
        answers={{
          foo: {
            bar: "blaaah",
          },
        }}
        path="foo.bar"
      />
    )
    expect(screen.getByText("blaaah"))
  })

  it("returns nothing if the answer is an empty string", () => {
    render(
      <EchoField
        answers={{
          foo: {
            bar: "",
          },
        }}
        path="foo.bar"
      />
    )
    expect(screen.queryByTestId("echo")).toBeNull()
  })

  it("returns nothing if the answer is not a simple string", () => {
    render(
      <EchoField
        answers={{
          foo: {
            bar: ["one", "two"],
          },
        }}
        path="foo.bar"
      />
    )
    expect(screen.queryByTestId("echo")).toBeNull()
  })

  it("returns nothing if there is no answer", () => {
    render(
      <EchoField
        answers={{
          foo: {},
        }}
        path="foo.bar"
      />
    )
    expect(screen.queryByTestId("echo")).toBeNull()
  })
})
