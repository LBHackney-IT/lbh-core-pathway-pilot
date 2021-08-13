import { render, screen } from "@testing-library/react"
import FlexibleAnswers from "./FlexibleAnswers"

describe(`ExpandDetails`, () => {
  it("renders basic answers correctly", async () => {
    render(
      <FlexibleAnswers
        answers={{
          bar: { "example question": "red" },
          foo: {
            date: "example answer 1",
            name: "example answer 2",
            "repeater-example": ["test 1", "test 2"],
          },
        }}
      />
    )

    const headings = await screen.findAllByRole("heading")
    expect(headings.length).toBe(2)

    const buttons = await screen.findAllByRole("button")
    expect(buttons.length).toBe(2)

    expect(screen.findByText("bar"))
    expect(screen.findByText("example question"))
    expect(screen.findByText("red"))

    expect(screen.findByText("foo"))
    expect(screen.findByText("example answer 1"))
    expect(screen.findByText("example answer 2"))
    expect(screen.findByText("test 1"))
    expect(screen.findByText("test 2"))
  })

  it("renders repeater groups correctly", async () => {
    render(
      <FlexibleAnswers
        answers={{
          foo: {
            "Key contacts": [
              {
                su: "choice-one",
                bar: ["choice-one"],
                blah: "2021-05-21",
                foo: ["blah", "blaah"],
              },
            ],
          },
        }}
      />
    )
    expect(screen.findByText("Key contacts"))
    expect(screen.findByText("su: choice-one"))
    expect(screen.findByText("bar: choice-one"))
    expect(screen.findByText("blah: 2021-05-21"))
    expect(screen.findByText("foo: blah, blaah"))
  })

  it("shows diffs on simple string answers", async () => {
    render(
      <FlexibleAnswers
        answers={{
          foo: {
            "Key contacts": "blah",
          },
        }}
        answersToCompare={{
          foo: {
            "Key contacts": "blurg",
          },
        }}
      />
    )
    expect(screen.getByText("blah"))
    expect(screen.getByText("blurg"))
    expect(screen.getByRole("insertion"))
    expect(screen.getByRole("deletion"))
  })

  it("enforces the correct sort order", () => {
    render(
      <FlexibleAnswers
        answers={{
          last: {
            test: "",
          },
          bar: {
            test: "blah",
          },
          foo: {
            test: "blah",
          },
        }}
        form={{
          id: "",
          name: "",
          themes: [
            {
              id: "",
              name: "",
              steps: [
                {
                  id: "foo",
                  name: "",
                  fields: [],
                },
                {
                  id: "bar",
                  name: "",
                  fields: [],
                },
              ],
            },
            {
              id: "",
              name: "",
              steps: [
                {
                  id: "last",
                  name: "",
                  fields: [],
                },
              ],
            },
          ],
        }}
      />
    )
    expect(screen.getAllByRole("heading")[0]).toContainHTML("foo")
    expect(screen.getAllByRole("heading")[1]).toContainHTML("bar")
    expect(screen.getAllByRole("heading")[2]).toContainHTML("last")
  })
})
