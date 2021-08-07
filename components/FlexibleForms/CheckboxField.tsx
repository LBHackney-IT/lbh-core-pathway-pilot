import {
  Field as RawField,
  ErrorMessage,
  getIn,
  FormikValues,
  FormikErrors,
  FormikTouched,
} from "formik"
import cx from "classnames"

interface FieldProps {
  touched: FormikTouched<FormikValues>
  errors: FormikErrors<FormikValues>
  name: string
  label: string
  type?: string
  hint?: string
  className?: string
  required?: boolean
  choices: {
    value: string
    label: string
  }[]
  disabled?: boolean
}

const Field = ({
  touched,
  errors,
  name,
  label,
  hint,
  className,
  choices,
  required,
  disabled,
}: FieldProps): React.ReactElement => (
  <div
    className={`govuk-form-group lbh-form-group ${
      getIn(touched, name) && getIn(errors, name) && "govuk-form-group--error"
    }`}
  >
    <fieldset
      className="govuk-fieldset"
      aria-describedby={hint && `${name}-hint`}
    >
      <legend className="govuk-label lbh-label" data-testid={name}>
        {label}{" "}
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
            {msg}
          </p>
        )}
      </ErrorMessage>

      <div className={cx(`govuk-checkboxes lbh-checkboxes`, className)}>
        {choices.map(choice => (
          <div className="govuk-checkboxes__item" key={choice.value}>
            <RawField
              type="checkbox"
              name={name}
              value={choice.value}
              id={`${name}-${choice.value}`}
              className="govuk-checkboxes__input"
              disabled={disabled}
            />

            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor={`${name}-${choice.value}`}
            >
              {choice.label}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  </div>
)

export default Field
