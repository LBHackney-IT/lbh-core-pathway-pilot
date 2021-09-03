import { Workflow } from "@prisma/client"
import {
  ErrorMessage,
  Field,
  FormikErrors,
  FormikTouched,
  FormikValues,
  getIn,
} from "formik"
import nextSteps from "../config/nextSteps/nextStepOptions"
import { Form } from "../types"
import TextField from "../components/FlexibleForms/TextField"

interface Props {
  workflow: Workflow & { form?: Form }
  errors: FormikErrors<FormikValues>
  touched: FormikTouched<FormikValues>
}

const NextStepFields = ({
  workflow,
  errors,
  touched,
}: Props): React.ReactElement => {
  const nextStepChoices = nextSteps.filter(nextStep =>
    nextStep?.formIds?.includes(workflow?.formId)
  )

  const name = "nextSteps"

  if (nextStepChoices.length === 0) return null

  return (
    <div
      className={`govuk-form-group lbh-form-group ${
        getIn(touched, name) && getIn(errors, name) && "govuk-form-group--error"
      }`}
    >
      <fieldset className="govuk-fieldset">
        <legend className="govuk-label lbh-label" data-testid={name}>
          What should happen next?
        </legend>

        <ErrorMessage name={name}>
          {msg => (
            <p className="govuk-error-message lbh-error-message" role="alert">
              <span className="govuk-visually-hidden">Error:</span>
              {msg}
            </p>
          )}
        </ErrorMessage>

        <div className="govuk-checkboxes lbh-checkboxes">
          {nextStepChoices.map(choice => (
            <div className="govuk-checkboxes__item" key={choice.id}>
              <Field
                type="checkbox"
                name={name}
                value={choice.id}
                id={`${name}-${choice.id}`}
                className="govuk-checkboxes__input"
                aria-describedby={`${name}-${choice.id}-hint`}
              />

              <label
                className="govuk-label govuk-checkboxes__label"
                htmlFor={`${name}-${choice.id}`}
              >
                {choice.title}
              </label>

              {choice.description && (
                <span
                  id={`${name}-${choice.id}-hint`}
                  className="govuk-hint govuk-checkboxes__hint lbh-hint"
                >
                  {choice.description}
                </span>
              )}

              {choice.handoverNote && (
                <TextField
                  label="Why is this necessary?"
                  name="??"
                  errors={errors}
                  touched={touched}
                  as="textarea"
                  // noErrors
                  // required
                />
              )}

              {choice.createForDifferentPerson && (
                <TextField
                  label="Social care ID"
                  name="??"
                  errors={errors}
                  touched={touched}
                  className="govuk-input--width-10"
                  // noErrors
                  // required
                />
              )}
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export default NextStepFields
