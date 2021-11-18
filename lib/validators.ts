import * as Yup from "yup"
import { Answer, Field, Form } from "../types"
import { ObjectShape, OptionalObjectSchema, TypeOfShape } from "yup/lib/object"
import { getTotalHours } from "./forms"
import { Team, User, WorkflowType } from "@prisma/client"
import nextStepOptions from "../config/nextSteps/nextStepOptions"

export const authorisationSchema = Yup.object().shape({
  action: Yup.string().required(
    "You must choose whether to authorise or return this work"
  ),
  comment: Yup.string().when("action", {
    is: "return",
    then: Yup.string()
      .required("You must give a reason")
      .min(5, "That reason is too short"),
    otherwise: Yup.string(),
  }),
})

export const acknowledgementSchema = Yup.object().shape({
  financeTeam: Yup.string().required(
    "You must choose which team is acknowledging this workflow"
  ),
})

export const profileSchema = Yup.object().shape({
  shortcuts: Yup.array().of(Yup.string()),
})

export const managerApprovalSchema = Yup.object().shape({
  action: Yup.string().required(
    "You must choose whether to approve or return this work"
  ),
  panelApproverEmail: Yup.string().when("action", {
    is: "approve-with-qam",
    then: Yup.string()
      .required("You must assign an authoriser")
      .email("You must provide a valid user"),
  }),
  comment: Yup.string().when("action", {
    is: "return",
    then: Yup.string()
      .required("You must give a reason")
      .min(5, "That reason is too short"),
    otherwise: Yup.string(),
  }),
})

export const newWorkflowSchema = (
  forms: Form[]
): OptionalObjectSchema<
  ObjectShape,
  Record<string, unknown>,
  TypeOfShape<ObjectShape>
> =>
  Yup.object().shape({
    socialCareId: Yup.string().required(),
    // for new workflows only
    formId: Yup.string()
      .oneOf(forms.map(o => o.id))
      .required("You must give an assessment type"),
    // for reviews only
    workflowId: Yup.string(),
    type: Yup.string().oneOf(Object.values(WorkflowType)),
    linkToOriginal: Yup.string(),
    reviewedThemes: Yup.array().of(Yup.string()),
  })

export const generateFinishSchema = (
  isScreening: boolean
): OptionalObjectSchema<
  ObjectShape,
  Record<string, unknown>,
  TypeOfShape<ObjectShape>
> => {
  const shape: Shape = {
    reviewBefore: Yup.date().when("reviewQuickDate", {
      is: val => val !== "no-review",
      then: Yup.date().required("You must provide a review date"),
      otherwise: Yup.date().nullable(),
    }),
    reviewQuickDate: Yup.string(),
    nextSteps: Yup.array().of(
      Yup.object().shape({
        nextStepOptionId: Yup.string()
          .oneOf(nextStepOptions.map(o => o.id))
          .required(),
        note: Yup.string().when("nextStepOptionId", {
          is: id => nextStepOptions.find(o => o.id === id).handoverNote,
          then: Yup.string()
            .required("You must give a note")
            .min(5, "That note is too short"),
          otherwise: Yup.string().oneOf([""]),
        }),
        altSocialCareId: Yup.string(),
      })
    ),
    // .min(1, "You must give at least one next step")
    approverEmail: Yup.string()
      .required("You must provide a user")
      .email("You must provide a valid user"),
  }

  if (isScreening) shape.reviewBefore = Yup.string()

  return Yup.object().noUnknown().shape(shape)
}

export const reviewReasonSchema = Yup.object().shape({
  answers: Yup.object().shape({
    review: Yup.object().shape({
      type: Yup.string().required("You must give a type"),
      reason: Yup.string().when("type", (type, schema) =>
        type === "Unplanned"
          ? schema
              .required("You must give a reason")
              .min(5, "That reason is too short")
          : schema
      ),
    }),
  }),
})

const getErrorMessage = (field: Field) => {
  if (field.error) return field.error
  if (field.type === "socialCareId")
    return `No resident matches that ID. You might need to add them`
  if (field.type === `timetable`) return `Total hours must be more than zero`
  if (field.type === `checkboxes`) return `Choose at least one item`
  if (
    field.type === "tags" ||
    field.type === "repeater" ||
    field.type === `repeaterGroup`
  )
    return `Add at least one ${field.itemName || "item"}`
  return `This question is required`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Shape = { [key: string]: Yup.AnySchema | Yup.ArraySchema<any> }

const applyRequired = (field: Field, shape: Shape): Yup.AnySchema => {
  if (field.type === "timetable") {
    return shape[field.id].test(
      "total",
      getErrorMessage(field),
      value => getTotalHours(value) !== 0
    )
  } else if (field.type === "socialCareId") {
    return (shape[field.id] as Yup.AnyObjectSchema).shape({
      Name: Yup.string().required(getErrorMessage(field)),
    })
  } else if (field.type === "datetime") {
    return (shape[field.id] as Yup.NumberSchema).min(2, getErrorMessage(field))
  } else if (
    field.type === "checkboxes" ||
    field.type === "tags" ||
    field.type === "repeater" ||
    field.type === "repeaterGroup"
  ) {
    return (shape[field.id] as Yup.NumberSchema).min(1, getErrorMessage(field))
  } else {
    return shape[field.id].required(getErrorMessage(field))
  }
}

/** create a validation schema for a flexible form, ignoring conditional fields */
export const generateFlexibleSchema = (
  fields: Field[]
): OptionalObjectSchema<
  ObjectShape,
  Record<string, unknown>,
  TypeOfShape<ObjectShape>
> => {
  const shape: Shape = {}

  fields.map(field => {
    if (field.type === "repeaterGroup") {
      // recursively generate a schema for subfields of a repeater group
      shape[field.id] = Yup.array().of(
        generateFlexibleSchema(field.subfields || [])
      )
    } else if (field.type === "timetable" || field.type === "socialCareId") {
      shape[field.id] = Yup.object()
    } else if (
      field.type === "checkboxes" ||
      field.type === "datetime" ||
      field.type === "repeater" ||
      field.type === "tags"
    ) {
      shape[field.id] = Yup.array().of(
        Yup.string().required(getErrorMessage(field))
      )
    } else {
      shape[field.id] = Yup.string()
    }

    if (field.required) {
      if (field.conditions) {
        shape[field.id] = (shape[field.id] as Yup.StringSchema).when(
          field.conditions.map(c => c.id),
          {
            is: (...valuesToTest: Answer[]) =>
              field.conditions?.every((condition, i) => {
                return valuesToTest[i] === condition.value
              }),
            then: applyRequired(field, shape),
            otherwise: shape[field.id],
          }
        )
      } else {
        // handle basic required fields
        shape[field.id] = applyRequired(field, shape)
      }
    }
  })

  return Yup.object().shape(shape)
}

export const generateUsersSchema = (
  users: User[]
): OptionalObjectSchema<
  ObjectShape,
  Record<string, unknown>,
  TypeOfShape<ObjectShape>
> => {
  const shape: Shape = {}
  users.map(
    user =>
      (shape[user.id] = Yup.object().shape({
        approver: Yup.boolean(),
        panelApprover: Yup.boolean(),
        team: Yup.string().nullable(),
      }))
  )
  return Yup.object().strict().shape(shape).noUnknown().required()
}

export const userSchema = Yup.object().shape({
  approver: Yup.boolean(),
  panelApprover: Yup.boolean(),
  team: Yup.string().nullable().oneOf(Object.values(Team)),
})
