import { Prisma, Team } from "@prisma/client"

export interface Allocation {
  id: number
  personId: number
  personDateOfBirth: string
  personName: string
  allocatedWorker?: string
  allocatedWorkerTeam: string
  workerType: string
  allocationStartDate: string
  allocationEndDate?: string
  caseStatus?: string
  personAddress?: string
}

export interface Choice {
  value: string
  label: string
  hint?: string
}

interface Condition {
  id: string
  value: string | boolean
}

type FieldType =
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
  | "echo"
  | "socialCareId"

export interface Field {
  id: string
  question: string
  type: FieldType | string
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
  /** for echo blocks only */
  path?: string
}

export interface Step {
  id: string
  name: string
  intro?: string
  fields: Field[]
  earlyFinish?: boolean
}

export interface Theme {
  id: string
  name: string
  steps: Step[]
}

export interface Form {
  id: string
  name: string
  themes: Theme[]
  linkable?: boolean
  approvable?: boolean
}

export interface RepeaterGroupAnswer {
  [key: string]: string | string[]
}

export interface TimetableAnswer {
  [key: string]: {
    [key: string]:
      | string
      | {
          [key: string]: string
        }
  }
}

export type Answer =
  | string
  | TimetableAnswer
  | RepeaterGroupAnswer
  | (string | RepeaterGroupAnswer)[]

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
  ethnicity?: string
  firstLanguage?: string
  religion?: string
  sexualOrientation?: string
  emailAddress?: string
  preferredMethodOfContact?: string
  otherNames?: {
    firstName?: string
    lastName?: string
  }[]
}

export interface ResidentFromSCCV {
  id?: number
  title?: string
  firstName?: string
  lastName?: string
  gender?: string
  dateOfBirth?: string
  dateOfDeath?: string
  ethnicity?: string
  firstLanguage?: string
  religion?: string
  sexualOrientation?: string
  nhsNumber?: number
  emailAddress?: string
  preferredMethodOfContact?: string
  contextFlag?: string
  restricted?: string
  address?: {
    address?: string
    postcode?: string
  }
  phoneNumbers?: {
    number?: string
    type?: string
  }[]
  otherNames?: {
    firstName?: string
    lastName?: string
  }[]
}

const revisionWithActor = Prisma.validator<Prisma.RevisionArgs>()({
  include: { actor: true },
})
export type RevisionWithActor = Prisma.RevisionGetPayload<
  typeof revisionWithActor
>

/** statuses a workflow can have */
export enum Status {
  InProgress = "INPROGRESS",
  Submitted = "SUBMITTED",
  ManagerApproved = "MANAGERAPPROVED",
  NoAction = "NOACTION",
  ReviewSoon = "REVIEWSOON",
  Overdue = "OVERDUE",
  Discarded = "DISCARDED",
}

export type Sort = "" | "recently-started"

export interface NextStepOption {
  id: string
  title: string
  description: string | null
  email: string | null
  formIds: string[]
  workflowToStart: string
  waitForApproval?: boolean
  waitForQamApproval?: boolean
  createForDifferentPerson?: boolean
  handoverNote?: boolean
}

export interface EditableUserValues {
  [key: string]: {
    approver: boolean
    panelApprover: boolean
    team?: Team
  }
}

export interface Shortcut {
  id: string
  title: string
  description?: string
  href: string
}

export interface AnswerFilter {
  id: string
  label: string
  formId?: string
  answers: {
    [key: string]: string[]
  }
}
