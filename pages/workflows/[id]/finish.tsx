import Layout from "../../../components/_Layout"
import { useRouter } from "next/router"
import { ErrorMessage, Field, Form, Formik } from "formik"
import { finishSchema } from "../../../lib/validators"
import ResidentWidget from "../../../components/ResidentWidget"
import { GetServerSideProps } from "next"
import { Workflow } from "@prisma/client"
import SelectField from "../../../components/FlexibleForms/SelectField"
import CheckboxField from "../../../components/FlexibleForms/CheckboxField"
import TextField from "../../../components/FlexibleForms/TextField"
import { useSession } from "next-auth/client"
import useResident from "../../../hooks/useResident"
import { useMemo } from "react"
import { quickDateChoices } from "../../../config"
import useUsers from "../../../hooks/useUsers"
import FormStatusMessage from "../../../components/FormStatusMessage"
import prisma from "../../../lib/prisma"
import nextSteps from "../../../config/nextSteps"

const NewWorkflowPage = (workflow: Workflow): React.ReactElement => {
  const { push, query } = useRouter()
  const [session] = useSession()
  const { data: resident } = useResident(workflow.socialCareId)
  const { data: users } = useUsers()

  const nextStepChoices = nextSteps?.map(nextStep => ({
    label: nextStep.title,
    value: nextStep.id,
    hint: nextStep.description,
  }))

  const approverChoices = [{ label: "", value: "" }].concat(
    users?.map(user => ({
      label: `${user.name} (${user.email})`,
      value: user.email,
    })) || []
  )

  const quickDates = useMemo(
    () =>
      Object.entries(quickDateChoices).map(([label, value]) => ({
        label,
        value,
      })),
    []
  )

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await fetch(`/api/workflows/${query.id}/finish`, {
        method: "POST",
        body: JSON.stringify(values),
      })
      const workflow = await res.json()
      if (workflow.error) throw workflow.error
      if (workflow.id) push(`/`)
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <Layout
      title="Send for approval"
      breadcrumbs={[
        { href: "/", text: "Dashboard" },
        {
          href: `/workflows/${query.id}`,
          text: `Workflow`,
        },
        { current: true, text: "Send for approval" },
      ]}
    >
      <div className="govuk-grid-row govuk-!-margin-bottom-8">
        <h1 className="govuk-grid-column-two-thirds">
          <legend>Send for approval</legend>
        </h1>
      </div>
      <div className="govuk-grid-row">
        <Formik
          initialValues={{
            approverEmail: "",
            reviewQuickDate: "",
            reviewBefore: "",
            nextSteps: [],
          }}
          onSubmit={handleSubmit}
          validationSchema={finishSchema}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
            <Form className="govuk-grid-column-two-thirds">
              <FormStatusMessage />

              {nextStepChoices.length > 0 && (
                <CheckboxField
                  name="nextSteps"
                  label="What should happen next?"
                  hint="Referred teams will be notified by email"
                  errors={errors}
                  touched={touched}
                  choices={nextStepChoices}
                />
              )}

              <fieldset
                className={`govuk-form-group lbh-form-group ${
                  touched.reviewBefore &&
                  errors.reviewBefore &&
                  "govuk-form-group--error"
                }`}
              >
                <legend className="govuk-label lbh-label">
                  When should this be reviewed?
                  <span className="govuk-required">
                    <span aria-hidden="true">*</span>
                    <span className="govuk-visually-hidden">required</span>
                  </span>
                </legend>

                <ErrorMessage name="reviewBefore">
                  {msg => (
                    <p
                      className="govuk-error-message lbh-error-message"
                      role="alert"
                    >
                      <span className="govuk-visually-hidden">Error:</span>
                      {msg}
                    </p>
                  )}
                </ErrorMessage>

                <div className="govuk-radios lbh-radios govuk-!-margin-top-4">
                  {quickDates.map(choice => (
                    <div className="govuk-radios__item" key={choice.value}>
                      <Field
                        type="radio"
                        name="reviewQuickDate"
                        value={choice.value}
                        id={`quickDate-${choice.value}`}
                        className="govuk-radios__input"
                        data-aria-controls={
                          choice.label === "Exact date" && "custom-date"
                        }
                        onChange={e => {
                          setFieldValue("reviewQuickDate", e.target.value)
                          setFieldValue("reviewBefore", e.target.value)
                        }}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor={`quickDate-${choice.value}`}
                      >
                        {choice.label}
                      </label>
                    </div>
                  ))}

                  <div className="govuk-radios__item">
                    <Field
                      type="radio"
                      name="reviewQuickDate"
                      value="exact-date"
                      id="reviewQuickDate-exact-date"
                      className="govuk-radios__input"
                      data-aria-controls="datepicker"
                      onChange={e => {
                        setFieldValue("reviewQuickDate", e.target.value)
                        setFieldValue("reviewBefore", "")
                      }}
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="reviewQuickDate-exact-date"
                    >
                      An exact date
                    </label>
                  </div>

                  {values.reviewQuickDate === "exact-date" && (
                    <div className="govuk-radios__conditional" id="datepicker">
                      <TextField
                        label="When?"
                        name="reviewBefore"
                        errors={errors}
                        touched={touched}
                        type="date"
                        className="govuk-input--width-10"
                        noErrors
                        required
                      />
                    </div>
                  )}
                </div>
              </fieldset>

              <SelectField
                name="approverEmail"
                label="Who should approve this?"
                hint="They'll be notified by email"
                errors={errors}
                touched={touched}
                choices={approverChoices}
                required
              />

              <button
                disabled={isSubmitting}
                className="govuk-button lbh-button"
              >
                Finish and send
              </button>
            </Form>
          )}
        </Formik>

        <div className="govuk-grid-column-one-third">
          <ResidentWidget socialCareId={resident?.mosaicId} />
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: id as string,
    },
  })

  // redirect if workflow doesn't exist
  if (!workflow)
    return {
      props: {},
      redirect: {
        destination: "/404",
      },
    }

  // redirect if workflow has already been submitted
  if (workflow.submittedAt)
    return {
      props: {},
      redirect: {
        destination: `/workflows/${id}`,
      },
    }

  return {
    props: {
      ...JSON.parse(JSON.stringify(workflow)),
    },
  }
}

export default NewWorkflowPage
