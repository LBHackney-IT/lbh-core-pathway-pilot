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
import { costPerHour } from "../../config"

interface Props {
  name: string
  label: string
  hint?: string
  disabled?: boolean
  summaryStats?: boolean
}

const TimetableField = ({
  name,
  hint,
  label,
  disabled,
  summaryStats,
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

  const totalHours = getTotalHours(values[name]?.timetable)
  const cost = Math.round(totalHours * costPerHour)

  // save the total hours and cost as their own values
  useEffect(() => {
    if (summaryStats) {
      setFieldValue(`${name}.summary.total hours`, totalHours.toString())
      setFieldValue(`${name}.summary.weekly cost`, `£${cost}`)
      setFieldValue(`${name}.summary.annual cost`, `£${cost * 52}`)
    }
  }, [totalHours, name, setFieldValue, cost, summaryStats])

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

        <span id={`${name}-hint`} className="govuk-hint lbh-hint">
          {hint || "In minutes"}
        </span>

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
                      max="480"
                      step="15"
                      name={`${name}.timetable.${shortDay}.${time}`}
                      disabled={disabled}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </fieldset>

      {summaryStats && (
        <>
          <p className="govuk-!-margin-top-4 lbh-body-s">
            {totalHours || 0} {totalHours === 1 ? "hour" : "hours"} total
          </p>
          <p className="govuk-!-margin-top-2 lbh-body-s">
            £{(cost * 52).toLocaleString("en-GB") || 0} estimated annual cost
            (or £{cost.toLocaleString("en-GB")} weekly, at the average brokered
            rate of £{costPerHour}/hour)
          </p>
        </>
      )}
    </div>
  )
}

export default TimetableField
