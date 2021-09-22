import { Resident } from "../types"
import { generateInitialValues, getTotalHours } from "./forms"

describe("generateInitialValues", () => {
  it("correctly handles different field types", () => {
    const result = generateInitialValues(
      [
        {
          id: "one",
          question: "",
          type: "text",
        },
        {
          id: "two",
          question: "",
          type: "checkboxes",
        },
        {
          id: "three",
          question: "",
          type: "repeater",
        },
        {
          id: "five",
          question: "",
          type: "select",
          choices: [
            {
              value: "blah",
              label: "",
            },
          ],
        },
        {
          id: "six",
          question: "",
          type: "timetable",
        },
        {
          id: "seven",
          question: "",
          type: "repeaterGroup",
          required: true,
          subfields: [
            {
              id: "eight",
              question: "",
              type: "text",
            },
          ],
        },
        {
          id: "nine",
          question: "",
          type: "datetime",
        },
      ],
      undefined
    )

    expect(result).toMatchObject({
      one: "",
      two: [],
      three: [],
      five: "blah",
      six: {},
      seven: [
        {
          eight: "",
        },
      ],
      nine: [],
    })
  })

  it("prefills if there's data available", () => {
    const result = generateInitialValues(
      [
        {
          id: "foo",
          question: "",
          prefill: "one" as keyof Resident,
          type: "text",
        },
        {
          id: "bar",
          question: "",
          prefill: "one" as keyof Resident,
          type: "select",
        },
        {
          id: "su",
          question: "",
          type: "text",
        },
      ],
      { one: "example value" } as unknown as Resident
    )

    expect(result).toMatchObject({
      foo: "example value",
      bar: "example value",
      su: "",
    })
  })

  it("applies a default value to a string-type or a datetime field", () => {
    const result = generateInitialValues([
      {
        id: "foo",
        question: "",
        type: "text",
        default: "bar",
      },
      {
        id: "one",
        question: "",
        type: "datetime",
        default: "two",
      },
    ])
    expect(result).toMatchObject({ foo: "bar", one: "two" })
  })

  it("doesn't add an initial entry for a non-required repeater group", () => {
    const result = generateInitialValues([
      {
        id: "foo",
        question: "",
        type: "repeaterGroup",
        subfields: [
          {
            id: "bar",
            question: "",
            type: "text",
          },
        ],
      },
    ])
    expect(result).toMatchObject({ foo: [] })
  })
})

describe("getTotalHours", () => {
  it("correctly calculates hours", () => {
    const result = getTotalHours({
      foo: {
        foo: "60",
        bar: "180",
      },
      bar: {
        foo: "300",
      },
    })
    expect(result).toBe(9)
  })
})
