import {
  getIn,
  FormikErrors,
  FormikTouched,
  FormikValues,
  useFormikContext,
} from "formik"
import cx from "classnames"
import useResident from "../../hooks/useResident"
import { prettyDate, prettyResidentName } from "../../lib/formatters"
import s from "./SocialCareIdField.module.scss"
import { useEffect } from "react"

interface FieldProps {
  touched: FormikTouched<FormikValues>
  errors: FormikErrors<FormikValues>
  name: string
  label: string
  type?: string
  hint?: string
  className?: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
}

const InfoPanel = ({ resident }) => {
  const dateOfBirth = prettyDate(resident?.dateOfBirth ?? "")
  const displayAddress = resident?.addressList?.[0]

  return (
    <div className={s.infoPanel}>
      <h3 className="lbh-heading-h4">
        <a
          target="_blank"
          rel="noreferrer"
          className="lbh-link lbh-link--no-visited-state"
          href={`${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident.mosaicId}`}
        >
          {prettyResidentName(resident)}
        </a>
      </h3>
      <p className="lbh-body-xs">#{resident.mosaicId}</p>
      <p className="lbh-body-xs">Born {dateOfBirth}</p>
      {displayAddress && (
        <p className="lbh-body-xs">
          {displayAddress?.addressLine1}
          <br />
          {displayAddress?.postCode}
        </p>
      )}
    </div>
  )
}

const Field = ({
  touched,
  errors,
  name,
  type,
  label,
  hint = "For example, 12345",
  className,
  required,
  placeholder,
  disabled,
}: FieldProps): React.ReactElement => {
  const { values, setFieldValue, setFieldTouched } = useFormikContext()

  const { data: resident } = useResident(
    getIn(values, `${name}.Social care ID`)
  )

  const showError = getIn(errors, `${name}.Name`) && getIn(touched, name)

  useEffect(() => {
    // store extra values about the resident
    setFieldValue(`${name}.Name`, prettyResidentName(resident))
    setFieldValue(
      `${name}.Date of birth`,
      prettyDate(resident?.dateOfBirth ?? "")
    )
  }, [resident, setFieldValue, name])

  return (
    <div
      className={`govuk-form-group lbh-form-group ${
        getIn(touched, name) && getIn(errors, name) && "govuk-form-group--error"
      }`}
    >
      <label
        htmlFor={name}
        data-testid={name}
        className="govuk-label lbh-label"
      >
        {label}
        {required && (
          <span className="govuk-required">
            <span aria-hidden="true">*</span>
            <span className="govuk-visually-hidden">required</span>
          </span>
        )}
      </label>

      {hint && (
        <span id={`${name}-hint`} className="govuk-hint lbh-hint">
          {hint}
        </span>
      )}

      {showError && (
        <p className="govuk-error-message lbh-error-message" role="alert">
          <span className="govuk-visually-hidden">Error:</span>
          {getIn(errors, `${name}.Name`)}
        </p>
      )}

      <input
        name={name}
        id={name}
        type={type}
        className={cx("govuk-input lbh-input govuk-input--width-5", className)}
        placeholder={placeholder}
        aria-describedby={hint && `${name}-hint`}
        disabled={disabled}
        onChange={e => {
          setFieldValue(`${name}.Social care ID`, e.target.value)
          setFieldTouched(name)
        }}
        value={getIn(values, `${name}.Social care ID`)}
      />

      {resident && <InfoPanel resident={resident} />}
    </div>
  )
}

export default Field
