import {
  Field as RawField,
  ErrorMessage,
  getIn,
  FormikErrors,
  FormikTouched,
  FormikValues,
} from "formik"
import s from "./DateTimeField.module.scss"

interface FieldProps {
  touched: FormikTouched<FormikValues>
  errors: FormikErrors<FormikValues>
  name: string
  label: string
  type?: string
  hint?: string
  className?: string
  as?: string
  rows?: number
  required?: boolean
  disabled?: boolean
}

const DateTimeField = ({
  touched,
  errors,
  name,
  label,
  hint,
  required,
  disabled,
}: FieldProps): React.ReactElement => (
  <fieldset
    className={`govuk-form-group lbh-form-group ${
      getIn(touched, name) && getIn(errors, name) && "govuk-form-group--error"
    }`}
  >
    <legend className="govuk-label lbh-label">
      {label}
      {required && (
        <span className="govuk-required">
          <span aria-hidden="true">*</span>
          <span className="govuk-visually-hidden">required</span>
        </span>
      )}
    </legend>

    {hint && (
      <span id={`${name}-hint`} className="govuk-hint lbh-hint">
        {hint}
      </span>
    )}

    <ErrorMessage name={name}>
      {msg => (
        <p className="govuk-error-message lbh-error-message" role="alert">
          <span className="govuk-visually-hidden">Error:</span>
          {Array.isArray(msg) ? msg[0] || msg[1] : msg}
        </p>
      )}
    </ErrorMessage>

    <label htmlFor={`${name}-date`} className="govuk-visually-hidden">
      Date
    </label>
    <RawField
      name={`${name}.0`}
      id={`${name}-date`}
      className={`govuk-input lbh-input ${s.date}`}
      aria-describedby={hint && `${name}-hint`}
      type="date"
      disabled={disabled}
    />

    <label htmlFor={`${name}-time`} className="govuk-visually-hidden">
      Time
    </label>
    <RawField
      name={`${name}.1`}
      id={`${name}-time`}
      className={"govuk-input lbh-input govuk-input--width-5"}
      aria-describedby={hint && `${name}-hint`}
      type="time"
      disabled={disabled}
    />
  </fieldset>
)

export default DateTimeField
