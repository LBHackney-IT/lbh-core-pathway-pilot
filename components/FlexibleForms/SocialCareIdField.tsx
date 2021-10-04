import {
  Field as RawField,
  ErrorMessage,
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

const Field = ({
  touched,
  errors,
  name,
  type,
  label,
  hint,
  className,
  required,
  placeholder,
  disabled,
}: FieldProps): React.ReactElement => {
  const { values } = useFormikContext()

  const { data: resident, error } = useResident(values[name])

  console.log(resident, error)

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

      <ErrorMessage name={name}>
        {msg => (
          <p className="govuk-error-message lbh-error-message" role="alert">
            <span className="govuk-visually-hidden">Error:</span>
            {msg}
          </p>
        )}
      </ErrorMessage>

      <RawField
        name={name}
        id={name}
        type={type}
        className={cx("govuk-input lbh-input", className)}
        placeholder={placeholder}
        aria-describedby={hint && `${name}-hint`}
        disabled={disabled}
      />

      {resident && (
        <div className={s.infoPanel}>
          <h3>{prettyResidentName(resident)}</h3>
          <p className="lbh-body-xs">#{resident.mosaicId}</p>
          <p className="lbh-body-xs">Born {prettyDate(resident.dateOfBirth)}</p>
          {resident?.addressList?.[0] && (
            <p className="lbh-body-xs">
              {resident?.addressList?.[0]?.addressLine1}
              <br />
              {resident?.addressList?.[0]?.postCode}
            </p>
          )}
        </div>
      )}

      {values?.[name]?.length > 0 && !resident && (
        <p className="lbh-body-xs">
          No resident matches that ID. You might need to{" "}
          <a
            className="lbh-link lbh-link--no-visited-state"
            href={`${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/add`}
          >
            add them first
          </a>
          .
        </p>
      )}
    </div>
  )
}

export default Field
