import { Field, TimetableAnswer, Resident } from "../types"
import { JsonValue } from "type-fest";

type InitialValue = null | string | string[] | InitialValues[] | unknown

export interface InitialValues {
  [key: string]: InitialValue
}

const initiallyNull = new Set(["file"])
const initiallyFirstChoice = new Set(["select"])
const initiallyArray = new Set(["checkboxes", "repeater", "tags"])

export const days: {
  [key: string]: string
} = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
  "Any day": "Any day",
}

export const times = ["Morning", "Afternoon", "Evening", "Night", "Any time"]

const generateInitialTimetableValues = (): TimetableAnswer => {
  const initialTimetableValues: TimetableAnswer = {}
  Object.keys(days).map(day => {
    initialTimetableValues[day] = {}
    times.map(time => (initialTimetableValues[day][time] = ""))
  })
  return initialTimetableValues
}

/** Generate flexible initial values for a flexible schema */
export const generateInitialValues = (
  fields: Field[],
  person?: Resident
): InitialValues => {
  const initialValues: InitialValues = {}

  fields.map(field => {
    if (field.type === "repeaterGroup") {
      if (field.required) {
        initialValues[field.id] = [
          generateInitialValues(field.subfields || [], person),
        ]
      } else {
        initialValues[field.id] = []
      }
    } else if (field.type === "socialCareId") {
      initialValues[field.id] = {
        "Social care ID": "",
        "Name": "",
        "Date of birth": ""
      }
    } else if (field.type === "timetable") {
      initialValues[field.id] = {
        timetable: generateInitialTimetableValues(),
        summary: {
          "total hours": "",
          "weekly cost": "",
          "annual cost": "",
        }
      }
    } else if (field.type === "datetime") {
      initialValues[field.id] = field.default || []
    } else if (initiallyArray.has(field.type)) {
      initialValues[field.id] = []
    } else if (initiallyNull.has(field.type)) {
      initialValues[field.id] = null
    } else if (initiallyFirstChoice.has(field.type)) {
      initialValues[field.id] = String(
        (person && field.prefill && person[field.prefill]) ||
          (field.choices && field.choices[0].value)
      )
    } else {
      initialValues[field.id] = String(
        (person && field.prefill && person[field.prefill]) ||
          field.default ||
          ""
      )
    }
  })
  return initialValues
}

/** Push an element into an array, without duplicates */
export const pushUnique = <T>(array: T[], newElement: T): T[] =>
  Array.from(new Set(array).add(newElement))

/** Take the values of a timetable question and get the sum total hours */
export const getTotalHours = (values: TimetableAnswer): number => {
  let total = 0
  if (typeof values === "object") {
    total = Object.values(values)?.reduce(
      (sum, day) =>
        sum +
        Object.values(day)?.reduce((sum, time) => sum + (Number(time) || 0), 0),
      0
    )
  }
  if (typeof total === "number") return Number((total / 60).toFixed(2))
  return 0
}

const flattenObj = (obj: JsonValue, result: { [key: string]: string } = {}): JsonValue => {
  for (const key in obj as Record<string, unknown>) {
    if (typeof obj[key] == 'object') {
      flattenObj(obj[key], result);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

export const extractAnswer = (answers: JsonValue, questionId: string): string | undefined => flattenObj(answers)?.[questionId];
