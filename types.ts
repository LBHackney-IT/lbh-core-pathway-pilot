import { Workflow, User, Revision, Session, Prisma } from "@prisma/client"

export interface Choice {
  value: string
  label: string
}

interface Condition {
  id: string
  value: string | boolean
}

export interface Field {
  id: string
  question: string
  type:
    | "text"
    | "textarea"
    | "date"
    | "datetime"
    | "radios"
    | "checkboxes"
    | "select"
    | "repeater"
    | "repeaterGroup"
    | "timetable"
    | "tags"
    | "combobox"
  hint?: string
  error?: string
  placeholder?: string
  conditions?: Condition[]
  className?: string
  /** on conditional fields, required value is only respected when all conditions are met */
  required?: boolean
  /** give an initial, default value for datetime and string-type fields */
  default?: string | [string, string]
  /** for select, radio, checkboxes, tags and combobox fields */
  choices?: Choice[]
  /** checkbox, file and repeater fields don't support prefilling */
  prefill?: keyof Resident
  /** for repeater groups only */
  subfields?: Field[]
  /** for repeater and repeater groups, a singular item name for more descriptive buttons and legends  */
  itemName?: string
}

export interface Step {
  id: string
  name: string
  intro?: string
  fields: Field[]
}

export interface Theme {
  id: string
  name: string
  steps: Step[]
}

export interface Form {
  id: string
  name: string
  teams?: string[]
  themes: Theme[]
}

export interface RepeaterGroupAnswer {
  [key: string]: string | string[]
}

export interface TimetableAnswer {
  [key: string]: {
    [key: string]: string
  }
}

export type Answer = string | TimetableAnswer | (string | RepeaterGroupAnswer)[]

export interface StepAnswers {
  // questions and answers
  [key: string]: Answer
}

export interface FlexibleAnswers {
  // sections
  [key: string]: StepAnswers
}

export interface Resident {
  mosaicId?: string
  firstName?: string
  lastName?: string
  uprn?: string
  dateOfBirth?: string
  ageContext?: string
  gender?: string
  nationality?: string
  phoneNumber?: {
    phoneNumber?: string
    phoneType?: string
  }[]
  addressList?: {
    endDate?: string
    contactAddressFlag?: string
    displayAddressFlag?: string
    addressLine1?: string
    addressLine2?: string
    addressLine3?: string
    postCode?: string
  }[]
  nhsNumber?: string
  restricted?: string
}

export interface RevisionWithActor extends Revision {
  actor?: User
}

export interface WorkflowWithExtras extends Workflow {
  creator?: User
  assignee?: User
  updater?: User
  submitter?: User
  managerApprover?: User
  panelApprover?: User
  discarder?: User
  nextReview?: Workflow
  previousReview?: Workflow
  form?: Form
  revisions?: RevisionWithActor[]
}

/** a workflow that necessarily includes the next review */
const workflowWithNextReview = Prisma.validator<Prisma.WorkflowArgs>()({
  include: { nextReview: true },
})
export type WorkflowWithNextReview = Prisma.WorkflowGetPayload<
  typeof workflowWithNextReview
>

/** statuses a workflow can have */
export enum Status {
  Discarded = "DISCARDED",
  ReviewSoon = "REVIEWSOON",
  NoAction = "NOACTION",
  ManagerApproved = "MANAGERAPPROVED",
  Submitted = "SUBMITTED",
  InProgress = "INPROGRESS",
  Overdue = "OVERDUE",
}

export interface UserWithSession extends User {
  sessions: Session[]
}
