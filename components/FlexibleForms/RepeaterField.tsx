import {
  Field as RawField,
  FieldArray,
  useFormikContext,
  getIn,
  ErrorMessage,
  FormikErrors,
  FormikTouched,
  FormikValues,
} from "formik"
import s from "./Repeater.module.scss"
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
  itemName?: string
  disabled?: boolean
}

const RepeaterField = ({
  touched,
  errors,
  name,
  label,
  hint,
  className,
  itemName,
  required,
  disabled,
}: FieldProps): React.ReactElement => {
  const { values } = useFormikContext()

  const repeaterValues = [].concat(getIn(values, name))

  return (
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
              {Array.isArray(msg) ? msg[0] : msg}
            </p>
          )}
        </ErrorMessage>

        <FieldArray name={name}>
          {({ remove, push }) => (
            <>
              {repeaterValues.map((item, i) => (
                <div className={s.row} key={i}>
                  <label
                    className="govuk-visually-hidden"
                    htmlFor={`${name}.${i}`}
                  >
                    {label}
                  </label>

                  <RawField
                    name={`${name}.${i}`}
                    id={`${name}.${i}`}
                    className={cx(`govuk-input lbh-input`, className)}
                    disabled={disabled}
                  />

                  {!disabled && (
                    <button
                      type="button"
                      className="lbh-link"
                      onClick={() => remove(i)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                disabled={disabled}
                onClick={() => push("")}
                className={`govuk-button lbh-button lbh-button--add ${s.addAnother}`}
              >
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path d="M6.94 0L5 0V12H6.94V0Z" />
                  <path d="M12 5H0V7H12V5Z" />
                </svg>
                {repeaterValues.length > 0
                  ? `Add another ${itemName || "item"}`
                  : `Add ${itemName || "item"}`}
              </button>
            </>
          )}
        </FieldArray>
      </fieldset>
    </div>
  )
}

export default RepeaterField
