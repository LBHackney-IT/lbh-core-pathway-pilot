import {
  Field as RawField,
  ErrorMessage,
  getIn,
  FormikErrors,
  FormikTouched,
  FormikValues,
} from 'formik';
import cx from 'classnames';

interface FieldProps {
  touched: FormikTouched<FormikValues>;
  errors: FormikErrors<FormikValues>;
  name: string;
  label: string;
  type?: string;
  hint?: string;
  className?: string;
  required?: boolean;
  choices: {
    value: string;
    label: string;
  }[];
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
}: FieldProps): React.ReactElement => (
  <div
    className={`govuk-form-group lbh-form-group ${
      getIn(touched, name) && getIn(errors, name) && 'govuk-form-group--error'
    }`}
  >
    <label htmlFor={name} data-testid={name} className="govuk-label lbh-label">
      {label}{' '}
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
      {(msg) => (
        <p className="govuk-error-message lbh-error-message" role="alert">
          <span className="govuk-visually-hidden">Error:</span>
          {msg}
        </p>
      )}
    </ErrorMessage>

    <RawField
      as="select"
      name={name}
      id={name}
      aria-describedby={hint ? `${name}-hint` : false}
      className={cx(`govuk-select lbh-select`, className)}
    >
      {choices.map((choice) => (
        <option value={choice.value} key={choice.value}>
          {choice.label}
        </option>
      ))}
    </RawField>
  </div>
);

export default Field;
