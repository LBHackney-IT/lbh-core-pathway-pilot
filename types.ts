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
    // | "date"
    // | "datetime"
    | "radios"
    | "checkboxes"
    | "select"
  // | "repeater"
  // | "repeaterGroup"
  // | "timetable"
  // | "tags"
  // | "combobox"
  // | "file"
  hint?: string
  error?: string
  conditions?: Condition[]
  className?: string
  /** on conditional fields, required value is only respected when all conditions are met */
  required?: boolean
  /** give an initial, default value for datetime and string-type fields */
  default?: string | [string, string]
  /** for select, radio, checkboxes, tags and combobox fields */
  choices?: Choice[]
  /** checkbox, file and repeater fields don't support prefilling */
  prefill?: string
  /** for repeater groups only */
  subfields?: Field[]
  /** for πer and repeater groups, a singular item name for more descriptive buttons and legends  */
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
  themes: Theme[]
}
