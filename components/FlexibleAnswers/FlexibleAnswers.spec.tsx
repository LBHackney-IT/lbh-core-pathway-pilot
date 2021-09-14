import { fireEvent, render, screen } from "@testing-library/react"
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

    expect(screen.queryAllByRole("heading").length).toBe(2)
    expect(screen.queryAllByRole("button").length).toBe(2)

    expect(screen.getByText("bar"))
    expect(screen.getByText("example question"))
    expect(screen.getByText("red"))

    expect(screen.getByText("foo"))
    expect(screen.getByText("example answer 1"))
    expect(screen.getByText("example answer 2"))
    expect(screen.getByText("test 1"))
    expect(screen.getByText("test 2"))
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
    expect(screen.getByText("Key contacts"))
    expect(screen.getByText("su:").parentElement.innerHTML).toBe(
      "<strong>su:</strong> choice-one"
    )
    expect(screen.getByText("bar:").parentElement.innerHTML).toBe(
      "<strong>bar:</strong> choice-one"
    )
    expect(screen.getByText("blah:").parentElement.innerHTML).toBe(
      "<strong>blah:</strong> 2021-05-21"
    )
    expect(screen.getByText("foo:").parentElement.innerHTML).toBe(
      "<strong>foo:</strong> blah, blaah"
    )
  })

  it("can be forced to stay open", () => {
    render(
      <FlexibleAnswers
        forceOpen
        answers={{
          foo: {
            "Key contacts": "blah",
          },
        }}
      />
    )
    fireEvent.click(screen.getByText("foo"))
    expect(screen.getByText("blah"))
    fireEvent.click(screen.getByText("foo"))
    expect(screen.getByText("blah"))
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

  it("enforces the correct sort order for the steps", () => {
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

  it("enforces the correct sort order for the questions", () => {
    render(
      <FlexibleAnswers
        answers={{
          foo: {
            "Question 2": "blah",
            "Question 3": "blah",
            "Question 1": "blah",
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
                  fields: [
                    { id: "Question 1", question: "", type: "text" },
                    { id: "Question 2", question: "", type: "text" },
                    { id: "Question 3", question: "", type: "text" },
                  ],
                },
              ],
            },
          ],
        }}
      />
    )
    expect(screen.getAllByTestId("question")[0]).toContainHTML("Question 1")
    expect(screen.getAllByTestId("question")[1]).toContainHTML("Question 2")
    expect(screen.getAllByTestId("question")[2]).toContainHTML("Question 3")
  })
})
