import {
  FieldArray,
  useFormikContext,
  FormikValues,
  FormikErrors,
  FormikTouched,
} from "formik"
import { Field } from "../../types"
import s from "./Repeater.module.scss"
import FlexibleField from "./FlexibleFields"
import { generateInitialValues } from "../../lib/forms"

interface Props {
  name: string
  itemName?: string
  subfields: Field[]
  label: string
  hint?: string
  disabled?: boolean
}

const RepeaterGroupField = ({
  name,
  itemName,
  subfields,
  hint,
  label,
  disabled,
}: Props): React.ReactElement => {
  const {
    values,
    touched,
    errors,
  }: {
    values: FormikValues
    errors: FormikErrors<FormikValues>
    touched: FormikTouched<FormikValues>
  } = useFormikContext()

  const repeaterValues = [].concat(values[name])

  return (
    <div
      // see https://formik.org/docs/api/fieldarray#fieldarray-validation-gotchas
      className={`govuk-form-group lbh-form-group ${
        touched[name] &&
        errors[name] &&
        typeof errors[name] === "string" &&
        "govuk-form-group--error"
      }`}
    >
      <fieldset
        className="govuk-fieldset"
        aria-describedby={hint && `${name}-hint`}
      >
        <legend className="govuk-label lbh-label">{label}</legend>

        {hint && (
          <span id={`${name}-hint`} className="govuk-hint lbh-hint">
            {hint}
          </span>
        )}

        {touched[name] && errors[name] && typeof errors[name] === "string" && (
          <p className="govuk-error-message lbh-error-message" role="alert">
            <span className="govuk-visually-hidden">Error:</span>
            {errors[name]}
          </p>
        )}

        <FieldArray name={name}>
          {({ remove, push }) => (
            <>
              {repeaterValues.map((item, i) => (
                <div key={i} className={s.repeaterGroup}>
                  {subfields.map(subfield => (
                    <FlexibleField
                      values={values}
                      field={{
                        ...subfield,
                        id: `${name}.${i}.${subfield.id}`,
                      }}
                      touched={touched}
                      errors={errors}
                      key={subfield.id}
                      disabled={disabled}
                    />
                  ))}

                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className={s.close}
                    >
                      <span className="govuk-visually-hidden">Remove</span>

                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 13 13"
                        fill="none"
                      >
                        <path
                          d="M-0.0501709 1.36379L1.36404 -0.050415L12.6778 11.2633L11.2635 12.6775L-0.0501709 1.36379Z"
                          fill="#0B0C0C"
                        />
                        <path
                          d="M11.2635 -0.050293L12.6778 1.36392L1.36404 12.6776L-0.0501709 11.2634L11.2635 -0.050293Z"
                          fill="#0B0C0C"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  push(generateInitialValues(subfields))
                }}
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

export default RepeaterGroupField
