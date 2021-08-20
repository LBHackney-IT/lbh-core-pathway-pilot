import { useEffect } from "react"
import {
  Field,
  useFormikContext,
  FormikValues,
  FormikErrors,
  FormikTouched,
} from "formik"
import s from "./TimetableField.module.scss"
import { getTotalHours, days, times } from "../../lib/forms"
import { TimetableAnswer } from "../../types"

interface Props {
  name: string
  label: string
  hint?: string
  disabled?: boolean
}

const TimetableField = ({
  name,
  hint,
  label,
  disabled,
}: Props): React.ReactElement => {
  const {
    values,
    touched,
    errors,
    setFieldValue,
  }: {
    values: FormikValues
    touched: FormikTouched<FormikValues>
    errors: FormikErrors<FormikValues>
    setFieldValue: (name: string, value: string) => void
  } = useFormikContext<TimetableAnswer>()

  const totalHours = getTotalHours(values[name])

  // save the total hours as its own value
  useEffect(() => {
    setFieldValue(`${name} total hours`, totalHours.toString())
  }, [totalHours, name, setFieldValue])

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

        <table className={`govuk-table lbh-table ${s.table}`}>
          <thead>
            <tr>
              <td className="govuk-table__header"></td>
              {times.map(time => (
                <th
                  className="govuk-table__header govuk-body-s"
                  key={time}
                  scope="col"
                >
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {Object.keys(days).map(shortDay => (
              <tr key={shortDay} className="govuk-table__row">
                <th className="govuk-table__header govuk-body-s" scope="row">
                  <span aria-hidden="true">{shortDay}</span>
                  <span className="govuk-visually-hidden">
                    {days[shortDay]}
                  </span>
                </th>
                {times.map(time => (
                  <td className="govuk-table__cell" key={time}>
                    <Field
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      name={`${name}.${shortDay}.${time}`}
                      disabled={disabled}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </fieldset>
      <p>{totalHours || 0} hours total</p>
    </div>
  )
}

export default TimetableField
