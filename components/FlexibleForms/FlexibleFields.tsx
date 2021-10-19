import TextField from "./TextField"
import RadioField from "./RadioField"
import CheckboxField from "./CheckboxField"
import SelectField from "./SelectField"
import RepeaterField from "./RepeaterField"
import RepeaterGroupField from "./RepeaterGroupField"
import ComboboxField from "./ComboboxField"
import DateTimeField from "./DateTimeField"
import { FormikValues, FormikTouched, FormikErrors } from "formik"
import { Field, FlexibleAnswers } from "../../types"
import TimetableField from "./TimetableField"
import SocialCareIdField from "./SocialCareIdField"
import TagsField from "./TagsField"
import EchoField from "./EchoField"
import { QuoteFields } from "@aws-sdk/client-s3"

interface Props {
  values: FormikValues
  field: Field
  touched: FormikTouched<FormikValues>
  errors: FormikErrors<FormikValues>
  disabled?: boolean
  answers?: FlexibleAnswers
}

const FlexibleField = ({
  values,
  field,
  touched,
  errors,
  disabled,
  answers,
}: Props): React.ReactElement | null => {
  // check if there's more than one condition
  if (
    field.conditions &&
    !field.conditions.every(cond => values[cond.id] === cond.value)
  ) {
    values[field.id] = ""

    return null
  }

  if (field.type === "repeaterGroup" && field.subfields)
    return (
      <RepeaterGroupField
        name={field.id}
        subfields={field.subfields}
        label={field.question}
        disabled={disabled}
        {...field}
      />
    )

  if (field.type === "textarea")
    return (
      <TextField
        name={field.id}
        label={field.question}
        touched={touched}
        errors={errors}
        as="textarea"
        rows={3}
        disabled={disabled}
        {...field}
      />
    )

  if (field.type === "date")
    return (
      <TextField
        name={field.id}
        label={field.question}
        touched={touched}
        errors={errors}
        disabled={disabled}
        {...field}
      />
    )

  if (field.type === "datetime")
    return (
      <DateTimeField
        name={field.id}
        label={field.question}
        touched={touched}
        errors={errors}
        disabled={disabled}
        {...field}
      />
    )

  if (field.type === "text")
    return (
      <TextField
        name={field.id}
        label={field.question}
        touched={touched}
        errors={errors}
        disabled={disabled}
        {...field}
      />
    )

  if (field.type === "tags" && field.choices)
    return (
      <TagsField
        name={field.id}
        label={field.question}
        touched={touched}
        errors={errors}
        choices={field.choices}
        disabled={disabled}
        {...field}
      />
    )

  if (field.type === "repeater")
    return (
      <RepeaterField
        name={field.id}
        label={field.question}
        touched={touched}
        errors={errors}
        disabled={disabled}
        {...field}
      />
    )

  if (field.type === "checkboxes" && field.choices)
    return (
      <CheckboxField
        name={field.id}
        label={field.question}
        touched={touched}
        choices={field.choices}
        errors={errors}
        disabled={disabled}
        {...field}
      />
    )

  if (field.type === "combobox" && field.choices)
    return (
      <ComboboxField
        name={field.id}
        label={field.question}
        touched={touched}
        choices={field.choices}
        errors={errors}
        disabled={disabled}
        {...field}
      />
    )

  if (field.type === "select" && field.choices)
    return (
      <SelectField
        name={field.id}
        label={field.question}
        touched={touched}
        choices={field.choices}
        errors={errors}
        disabled={disabled}
        {...field}
      />
    )

  if (field.type === "radios" && field.choices)
    return (
      <RadioField
        name={field.id}
        label={field.question}
        touched={touched}
        choices={field.choices}
        errors={errors}
        disabled={disabled}
        {...field}
      />
    )

  if (field.type === "timetable")
    return (
      <TimetableField
        name={field.id}
        label={field.question}
        disabled={disabled}
        {...field}
      />
    )

  if (field.type === "socialCareId")
    return (
      <SocialCareIdField
        name={field.id}
        label={field.question}
        touched={touched}
        errors={errors}
        disabled={disabled}
        {...field}
      />
    )

  if (field.type === "echo" && answers)
    return <EchoField answers={answers} path={field.path} />

  return null
}

export default FlexibleField
