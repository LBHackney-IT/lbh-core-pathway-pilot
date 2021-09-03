import { Workflow } from "@prisma/client"
import {
  ErrorMessage,
  Field,
  FieldArray,
  FormikErrors,
  FormikTouched,
  FormikValues,
  getIn,
  useFormikContext,
} from "formik"
import nextSteps from "../config/nextSteps/nextStepOptions"
import { Form } from "../types"
import TextField from "../components/FlexibleForms/TextField"

const Choice = ({ choice, remove, push, values, name, errors, touched }) => {
  const i = values[name].findIndex(el => el.nextStepOptionId === choice.id)
  const checked = i !== -1

  return (
    <>
      <div className="govuk-checkboxes__item">
        <Field
          type="checkbox"
          id={`${name}-${choice.id}`}
          className="govuk-checkboxes__input"
          aria-describedby={`${name}-${choice.id}-hint`}
          onChange={() =>
            checked
              ? remove(i)
              : push({
                  nextStepOptionId: choice.id,
                  altSocialCareID: "",
                  note: "",
                })
          }
          checked={checked}
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
      </div>

      <div className="govuk-checkboxes__conditional">
        {choice.handoverNote && checked && (
          <TextField
            label="Why is this necessary?"
            name={`${name}.${i}.note`}
            errors={errors}
            touched={touched}
            as="textarea"
            required
          />
        )}

        {choice.createForDifferentPerson && checked && (
          <TextField
            label="Social care ID"
            name={`${name}.${i}.altSocialCareId`}
            errors={errors}
            touched={touched}
            className="govuk-input--width-10"
            required
          />
        )}
      </div>
    </>
  )
}

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
  const { values } = useFormikContext()

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
      <FieldArray name={name}>
        {({ remove, push }) => (
          <fieldset className="govuk-fieldset">
            <legend className="govuk-label lbh-label" data-testid={name}>
              What should happen next?
            </legend>

            <ErrorMessage name={name}>
              {msg => (
                <p
                  className="govuk-error-message lbh-error-message"
                  role="alert"
                >
                  <span className="govuk-visually-hidden">Error:</span>
                  {JSON.stringify(msg)}
                </p>
              )}
            </ErrorMessage>

            <div className="govuk-checkboxes lbh-checkboxes">
              {nextStepChoices.map(choice => (
                <Choice
                  name={name}
                  key={choice.id}
                  choice={choice}
                  values={values}
                  remove={remove}
                  errors={errors}
                  touched={touched}
                  push={push}
                />
              ))}
            </div>
          </fieldset>
        )}
      </FieldArray>
    </div>
  )
}

export default NextStepFields
