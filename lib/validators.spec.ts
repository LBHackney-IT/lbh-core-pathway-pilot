import { Team } from "@prisma/client"
import { ValidationError } from "yup"
import { mockForm } from "../fixtures/form"
import { mockResident } from "../fixtures/residents"
import { mockUser } from "../fixtures/users"
import { mockWorkflow } from "../fixtures/workflows"
import {
  newWorkflowSchema,
  generateFinishSchema,
  generateFlexibleSchema,
  generateUsersSchema,
} from "./validators"

const getMockNewWorkflowWithout = (toRemove = null) => {
  const mock = {
    socialCareId: mockResident.mosaicId,
    formId: mockForm.id,
    workflowId: mockWorkflow.id,
    reviewedThemes: [mockForm.themes[0].id],
    type: mockWorkflow.type,
  }

  if (toRemove) delete mock[toRemove]

  return mock
}

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

  it("handles a social care id field", async () => {
    const schema = generateFlexibleSchema([
      {
        id: "one",
        question: "foo",
        type: "socialCareId",
        required: true,
      },
    ])

    await expect(
      schema.validate({
        one: {
          "Social care ID": "",
          "Name": "",
          "Date of birth": ""
        },
      })
    ).rejects.toThrow()

    await expect(
      schema.validate({
        one: {
          "Social care ID": "123",
          "Name": "",
          "Date of birth": "foo"
        },
      })
    ).rejects.toThrow()


    await expect(
      schema.validate({
        one: {
          "Social care ID": "123",
          "Name": "bar",
          "Date of birth": "foo"
        },
      })
    ).toBeTruthy()
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
          team: Team.Access,
        },
        blah: {},
      })
    ).rejects.toThrowError()
  })

  it("validates", async () => {
    await expect(
      schema.validate({
        "123abc": {
          approver: true,
          panelApprover: false,
          team: Team.Access,
        },
        cde456: {
          approver: true,
          panelApprover: false,
          team: Team.Review,
        },
      })
    )
  })
})

describe("generateFinishSchema", () => {
  it("will accept an empty review date for a screening", async () => {
    const schema = generateFinishSchema(true)

    await expect(
      schema.validate({
        reviewQuickDate: "whatever",
        reviewBefore: "",
        nextSteps: [],
        approverEmail: "example@email.com",
      })
    )
  })

  it("will not accept an empty review date for anything else", async () => {
    const schema = generateFinishSchema(false)

    await expect(
      schema.validate({
        reviewQuickDate: "whatever",
        reviewBefore: "",
        nextSteps: [],
        approverEmail: "example@email.com",
      })
    ).rejects.toThrowError()
  })
})

describe("newWorkflowSchema", () => {
  it("throws a validation error if empty", async () => {
    const schema = newWorkflowSchema([mockForm])

    expect.assertions(1)

    await expect(() => schema.validate({})).rejects.toThrow(ValidationError)
  })

  it("throws a validation error if socialCareId is not set", async () => {
    const schema = newWorkflowSchema([mockForm])

    expect.assertions(1)

    await expect(() =>
      schema.validate(getMockNewWorkflowWithout("socialCareId"))
    ).rejects.toThrow(ValidationError)
  })

  it("throws a validation error if formId is unknown", async () => {
    const schema = newWorkflowSchema([mockForm])

    expect.assertions(1)

    await expect(() =>
      schema.validate({
        ...getMockNewWorkflowWithout(),
        formId: "invalid-form-id",
      })
    ).rejects.toThrow(ValidationError)
  })

  it("throws a validation error if formId is not provided", async () => {
    const schema = newWorkflowSchema([mockForm])

    expect.assertions(1)

    await expect(
      schema.validate(getMockNewWorkflowWithout("formId"))
    ).rejects.toThrow(ValidationError)
  })

  it("throws a validation error if type is not provided", async () => {
    const schema = newWorkflowSchema([mockForm])

    expect.assertions(1)

    await expect(
      schema.validate(getMockNewWorkflowWithout("type"))
    ).rejects.toThrow(ValidationError)
  })

  it("doesn't throw a validation error if workflow is valid", async () => {
    const schema = newWorkflowSchema([mockForm])

    expect.assertions(1)

    await expect(
      schema.validate(getMockNewWorkflowWithout())
    ).resolves.toStrictEqual({
      socialCareId: mockResident.mosaicId,
      formId: mockForm.id,
      workflowId: mockWorkflow.id,
      reviewedThemes: [mockForm.themes[0].id],
      type: mockWorkflow.type,
    })
  })

  it("throws a validation error if linkToOriginal is not a valid url", async () => {
    
    const mockFormLinkToOriginal = { ...mockForm, linkToOriginal: "www.example.com" }
    const schema = newWorkflowSchema([mockForm])

    expect.assertions(1)

    
    await expect(() => schema.validate(mockFormLinkToOriginal)).rejects.toThrow(ValidationError)
  })
})




