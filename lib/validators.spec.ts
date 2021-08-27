import { Team } from "@prisma/client"
import { mockUser } from "../fixtures/users"
import { generateFlexibleSchema, generateUsersSchema } from "./validators"

describe("generateFlexibleSchema", () => {
  it("handles different field types", async () => {
    const schema = generateFlexibleSchema([
      {
        question: "foo",
        id: "one",
        type: "text",
      },
      {
        question: "foo",
        id: "two",
        type: "textarea",
      },
      {
        question: "foo",
        id: "three",
        type: "checkboxes",
      },
      {
        question: "foo",
        id: "four",
        type: "repeater",
      },
      {
        question: "foo",
        id: "five",
        type: "select",
      },
      {
        question: "foo",
        id: "six",
        type: "radios",
      },
      {
        question: "foo",
        id: "seven",
        type: "timetable",
      },
      {
        question: "foo",
        id: "eight",
        type: "datetime",
      },
    ])

    const result = await schema.validate({
      one: "value",
      two: "value",
      three: ["example", "example 2"],
      four: ["example", "example 2"],
      five: "value",
      six: "value",
      seven: {},
      eight: [],
    })

    expect(result).toBeTruthy()
  })

  it("handles required fields", async () => {
    const schema = generateFlexibleSchema([
      {
        id: "one",
        question: "foo",
        type: "text",
        required: true,
      },
    ])

    await expect(
      schema.validate({
        one: "bar",
      })
    ).toBeTruthy()

    await expect(
      schema.validate({
        one: "",
      })
    ).rejects.toThrow()

    const schema2 = generateFlexibleSchema([
      {
        id: "one",
        question: "foo",
        type: "checkboxes",
        required: true,
      },
    ])

    await expect(
      schema2.validate({
        one: [],
      })
    ).rejects.toThrow()

    const schema3 = generateFlexibleSchema([
      {
        id: "one",
        question: "foo",
        type: "timetable",
        required: true,
      },
    ])

    await expect(
      schema3.validate({
        one: {
          Mon: {
            Morning: "0",
          },
        },
      })
    ).rejects.toThrow()

    const schema4 = generateFlexibleSchema([
      {
        id: "one",
        question: "foo",
        type: "datetime",
        required: true,
      },
    ])

    await expect(
      schema4.validate({
        one: ["test"],
      })
    ).rejects.toThrow()
  })

  it("handles custom error messages", async () => {
    const schema = generateFlexibleSchema([
      {
        id: "one",
        question: "foo",
        type: "text",
        required: true,
        error: "Example error message",
      },
    ])

    await expect(
      schema.validate({
        one: "",
      })
    ).rejects.toThrowError("Example error message")
  })

  it("can be used recursively for repeater groups", async () => {
    const schema = generateFlexibleSchema([
      {
        question: "foo",
        id: "foo",
        type: "repeaterGroup",
        required: true,
        subfields: [
          {
            id: "bar",
            question: "bar",
            type: "text",
            required: true,
          },
        ],
      },
    ])

    await expect(
      schema.validate({
        foo: [],
      })
    ).rejects.toThrowError("Add at least one item")

    await expect(
      schema.validate({
        foo: [
          {
            bar: "",
          },
        ],
      })
    ).rejects.toThrowError("This question is required")
  })

  it("becomes required when all conditions are met", async () => {
    const schema = generateFlexibleSchema([
      {
        id: "one",
        type: "text",
        question: "First question",
      },
      {
        id: "two",
        type: "text",
        question: "Second question",
      },
      {
        id: "three",
        type: "text",
        question: "Third question",
        required: true,
        conditions: [
          {
            id: "one",
            value: "yes",
          },
          {
            id: "two",
            value: "yes",
          },
        ],
      },
    ])

    await expect(
      schema.validate({
        one: "yes",
        two: "yes",
        three: "",
      })
    ).rejects.toThrowError("This question is required")

    await expect(
      schema.validate({
        one: "yes",
        two: "no",
        three: "",
      })
    )

    await expect(
      schema.validate({
        one: "yes",
        two: "yes",
        three: "yes",
      })
    )
  })
})

describe("usersSchema", () => {
  const schema = generateUsersSchema([
    mockUser,
    {
      ...mockUser,
      id: "cde456",
    },
  ])

  it("doesn't accept unknown user ids", async () => {
    await expect(
      schema.validate({
        "123abc": {
          approver: true,
          panelApprover: false,
          team: Team.InformationAssessment,
        },
        blah: {},
      })
    ).rejects.toThrowError()
  })

  it("invalidates for an invalid team", async () => {
    await expect(
      schema.validate({
        "123abc": {
          approver: true,
          panelApprover: false,
          team: "foo",
        },
        cde456: {
          approver: true,
          panelApprover: false,
          team: Team.LongTermCare,
        },
      })
    ).rejects.toThrowError()
  })

  it("validates", async () => {
    await expect(
      schema.validate({
        "123abc": {
          approver: true,
          panelApprover: false,
          team: Team.InformationAssessment,
        },
        cde456: {
          approver: true,
          panelApprover: false,
          team: Team.LongTermCare,
        },
      })
    )
  })
})
