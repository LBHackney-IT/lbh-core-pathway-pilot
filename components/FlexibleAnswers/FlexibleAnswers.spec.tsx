import { fireEvent, render, screen, within } from "@testing-library/react"
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
          approvable: true,
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

  it("sorts the answers if question 1 is a repeater group", () => {
    render(
      <FlexibleAnswers
        answers={{
          step: {
            "question-2": "answer to question 2",
            "question-1": [
              {
                "subfield-2": "subfield 2 answer",
                "subfield-3": "subfield 3 answer",
                "subfield-1": "subfield 1 answer",
              },
            ],
          },
        }}
        form={{
          id: "",
          name: "",
          approvable: true,
          themes: [
            {
              id: "",
              name: "",
              steps: [
                {
                  id: "step",
                  name: "",
                  fields: [
                    {
                      id: "question-1",
                      question: "Question 1?",
                      type: "repeaterGroup",
                      subfields: [
                        {
                          id: "subfield-1",
                          question: "Subfield question 1?",
                          type: "text",
                        },
                        {
                          id: "subfield-2",
                          question: "Subfield question 2?",
                          type: "text",
                        },
                        {
                          id: "subfield-3",
                          question: "Subfield question 3?",
                          type: "text",
                        },
                      ],
                    },
                    {
                      id: "question-2",
                      question: "Question 2?",
                      type: "text",
                    },
                  ],
                },
              ],
            },
          ],
        }}
      />
    )

    const subfieldsList = screen.getByText("subfield 1 answer").closest("ul")

    expect(within(subfieldsList).getAllByRole("listitem")[0]).toContainHTML(
      "subfield 1 answer"
    )
    expect(within(subfieldsList).getAllByRole("listitem")[1]).toContainHTML(
      "subfield 2 answer"
    )
    expect(within(subfieldsList).getAllByRole("listitem")[2]).toContainHTML(
      "subfield 3 answer"
    )
  })

  it("sorts the answers if question 2 is a repeater group", () => {
    render(
      <FlexibleAnswers
        answers={{
          step: {
            "question-2": [
              {
                "subfield-2": "subfield 2 answer",
                "subfield-3": "subfield 3 answer",
                "subfield-1": "subfield 1 answer",
              },
            ],
            "question-1": "answer to question 1",
          },
        }}
        form={{
          id: "",
          name: "",
          approvable: true,
          themes: [
            {
              id: "",
              name: "",
              steps: [
                {
                  id: "step",
                  name: "",
                  fields: [
                    {
                      id: "question-1",
                      question: "Question 1?",
                      type: "text",
                    },
                    {
                      id: "question-2",
                      question: "Question 2?",
                      type: "repeaterGroup",
                      subfields: [
                        {
                          id: "subfield-1",
                          question: "Subfield question 1?",
                          type: "text",
                        },
                        {
                          id: "subfield-2",
                          question: "Subfield question 2?",
                          type: "text",
                        },
                        {
                          id: "subfield-3",
                          question: "Subfield question 3?",
                          type: "text",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        }}
      />
    )

    const subfieldsList = screen.getByText("subfield 1 answer").closest("ul")

    expect(within(subfieldsList).getAllByRole("listitem")[0]).toContainHTML(
      "subfield 1 answer"
    )
    expect(within(subfieldsList).getAllByRole("listitem")[1]).toContainHTML(
      "subfield 2 answer"
    )
    expect(within(subfieldsList).getAllByRole("listitem")[2]).toContainHTML(
      "subfield 3 answer"
    )
  })

  it("sorts the answers if only question is a repeater group", () => {
    render(
      <FlexibleAnswers
        answers={{
          step: {
            "question-1": [
              {
                "subfield-2": "subfield 2 answer",
                "subfield-3": "subfield 3 answer",
                "subfield-1": "subfield 1 answer",
              },
            ],
          },
        }}
        form={{
          id: "",
          name: "",
          approvable: true,
          themes: [
            {
              id: "",
              name: "",
              steps: [
                {
                  id: "step",
                  name: "",
                  fields: [
                    {
                      id: "question-1",
                      question: "Question 1?",
                      type: "repeaterGroup",
                      subfields: [
                        {
                          id: "subfield-1",
                          question: "Subfield question 1?",
                          type: "text",
                        },
                        {
                          id: "subfield-2",
                          question: "Subfield question 2?",
                          type: "text",
                        },
                        {
                          id: "subfield-3",
                          question: "Subfield question 3?",
                          type: "text",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        }}
      />
    )

    const subfieldsList = screen.getByText("subfield 1 answer").closest("ul")

    expect(within(subfieldsList).getAllByRole("listitem")[0]).toContainHTML(
      "subfield 1 answer"
    )
    expect(within(subfieldsList).getAllByRole("listitem")[1]).toContainHTML(
      "subfield 2 answer"
    )
    expect(within(subfieldsList).getAllByRole("listitem")[2]).toContainHTML(
      "subfield 3 answer"
    )
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
          approvable: true,
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

  it("displays the timetable if values are at root-level", () => {
    const answers = {
      Timetable: {
        Question: {
          Mon: { Morning: "15", Afternoon: "30" },
          Tue: {},
          Wed: {},
          Thu: {},
          Fri: { Evening: "60", Night: "75" },
          Sat: {},
          Sun: {},
          "Any day": {},
        },
      },
    }

    render(
      <FlexibleAnswers
        answers={answers}
        form={{
          id: "",
          name: "",
          approvable: true,
          themes: [
            {
              id: "",
              name: "",
              steps: [
                {
                  id: "Timetable",
                  name: "Timetable",
                  fields: [{ id: "Question", question: "", type: "timetable" }],
                },
              ],
            },
          ],
        }}
      />
    )

    const mondayRow = screen.getByText("Mon").closest("tr")

    expect(within(mondayRow).getByText(15)).toBeVisible()
    expect(within(mondayRow).getByText(30)).toBeVisible()

    const fridayRow = screen.getByText("Fri").closest("tr")

    expect(within(fridayRow).getByText(60)).toBeVisible()
    expect(within(fridayRow).getByText(75)).toBeVisible()
  })

  it("displays the timetable if values are in a timetable property", () => {
    const answers = {
      Timetable: {
        Question: {
          timetable: {
            Mon: { Morning: "15", Afternoon: "30" },
            Tue: {},
            Wed: {},
            Thu: {},
            Fri: { Evening: "60", Night: "75" },
            Sat: {},
            Sun: {},
            "Any day": {},
          },
        },
      },
    }

    render(
      <FlexibleAnswers
        answers={answers}
        form={{
          id: "",
          name: "",
          approvable: true,
          themes: [
            {
              id: "",
              name: "",
              steps: [
                {
                  id: "Timetable",
                  name: "Timetable",
                  fields: [{ id: "Question", question: "", type: "timetable" }],
                },
              ],
            },
          ],
        }}
      />
    )

    const mondayRow = screen.getByText("Mon").closest("tr")

    expect(within(mondayRow).getByText(15)).toBeVisible()
    expect(within(mondayRow).getByText(30)).toBeVisible()

    const fridayRow = screen.getByText("Fri").closest("tr")

    expect(within(fridayRow).getByText(60)).toBeVisible()
    expect(within(fridayRow).getByText(75)).toBeVisible()
  })

  it("displays a social care ID answer", () => {
    const answers = {
      Step: {
        "Carer's social care ID": {
          Name: "Jane Doe",
          "Date of birth": "21 Sept 1995",
          "Social care ID": "24",
        },
      },
    }

    render(
      <FlexibleAnswers
        answers={answers}
        form={{
          id: "",
          name: "",
          approvable: true,
          themes: [
            {
              id: "",
              name: "",
              steps: [
                {
                  id: "Step",
                  name: "Step",
                  fields: [
                    {
                      id: "Carer's social care ID",
                      question: "Carer's social care ID",
                      type: "socialCareId",
                    },
                  ],
                },
              ],
            },
          ],
        }}
      />
    )

    expect(screen.getByText("Jane Doe")).toBeVisible()
    expect(screen.getByText("#24")).toBeVisible()
    expect(screen.getByText("21 Sept 1995")).toBeVisible()
  })

  it("doesn't display a social care ID answer if it's empty", () => {
    const answers = {
      Step: {
        "Carer's social care ID": {
          Name: "",
          "Date of birth": "",
          "Social care ID": "",
        },
      },
    }

    render(
      <FlexibleAnswers
        answers={answers}
        form={{
          id: "",
          name: "",
          approvable: true,
          themes: [
            {
              id: "",
              name: "",
              steps: [
                {
                  id: "Step",
                  name: "Step",
                  fields: [
                    {
                      id: "Carer's social care ID",
                      question: "Carer's social care ID",
                      type: "socialCareId",
                    },
                  ],
                },
              ],
            },
          ],
        }}
      />
    )

    expect(screen.queryByText("Carer's social care ID")).not.toBeInTheDocument()
  })

  it("formats a date", () => {
    const answers = {
      Step: {
        "date-question": "2021-11-09",
      },
    }

    render(
      <FlexibleAnswers
        answers={answers}
        form={{
          id: "",
          name: "",
          approvable: true,
          themes: [
            {
              id: "",
              name: "",
              steps: [
                {
                  id: "Step",
                  name: "Step",
                  fields: [
                    {
                      id: "date-question",
                      question: "Date question?",
                      type: "date",
                    },
                  ],
                },
              ],
            },
          ],
        }}
      />
    )

    expect(screen.queryByText("2021-11-09")).not.toBeInTheDocument()
    expect(screen.queryByText("9 Nov 2021")).toBeVisible()
  })
})
