import Layout from "../../components/_Layout"
import { useRouter } from "next/router"
import { Resident } from "../../types"
import { useState } from "react"
import TextField from "../../components/FlexibleForms/TextField"
import SelectField from "../../components/FlexibleForms/SelectField"
import { Form, Formik, Field, ErrorMessage } from "formik"
import formsConfig from "../../config/forms"
import { newWorkflowSchema } from "../../lib/validators"
import ResidentWidget from "../../components/ResidentWidget"
import { GetServerSideProps } from "next"
import { getResidentById } from "../../lib/residents"
import prisma from "../../lib/prisma"
import { Workflow, WorkflowType } from "@prisma/client"
import FormStatusMessage from "../../components/FormStatusMessage"
import { prettyResidentName } from "../../lib/formatters"
import { Form as FormT } from "../../types"
import { csrfFetch } from "../../lib/csrfToken"
import { protectRoute } from "../../lib/protectRoute"
import { screeningFormId } from "../../config"
import { pilotGroup } from "../../config/allowedGroups"
import useWorkflowsByResident from "../../hooks/useWorkflowsByResident"
import { getLinkableWorkflows } from "../../lib/linkableWorkflows"

interface Props {
  resident: Resident
  forms: FormT[]
  workflowTypes: WorkflowType[]
}

const NewWorkflowPage = ({
  resident,
  forms,
  workflowTypes,
}: Props): React.ReactElement => {
  const { push, query } = useRouter()

  const choices = forms.map(form => ({
    label: form.name,
    value: form.id,
  }))

  const workflowTypeOptions = workflowTypes
    .filter(workflow => workflow !== "Historic")
    .map(workflow => ({
      label:
        workflow === "Assessment"
          ? "Start a new assessment"
          : `Start a ${workflow.toLowerCase()}`,
      value: workflow,
    }))

  const formLabels = {
    Assessment: {
      formId: {
        label: "Please choose the type of assessment you want to start",
        hint: "If the assessment you need isn't here, use the old form.",
      },
      workflowId: {
        label: "Is the assessment linked to any of these previous workflows?",
        hint: "",
      },
    },
    Reassessment: {
      formId: {
        label:
          "Please select the type of reassessment you would like to complete",
        hint: "",
      },
      workflowId: {
        label: "Which workflow do you want to reassess?",
        hint: "In most cases, this will be the workflow with the most up-to-date support plan for this person.",
      },
      linkToOriginal: {
        label:
          "If you have a link to the previous assessment or review, add it here",
        hint: "For example if the assessment was completed via google form.",
      },
    },
    Review: {
      formId: {
        label: "Please select the type of review you would like to complete",
        hint: "",
      },
      workflowId: {
        label: "Which workflow do you want to review?",
        hint: "Use the workflow with the most up-to-date support plan for this person.",
      },
      linkToOriginal: {
        label:
          "If you have a link to the previous assessment or review, add it here",
        hint: "For example if the assessment was completed via google form.",
      },
    },
  }

  const handleSubmit = async (values, { setStatus }) => {
    if (values.workflowId) {
      values.linkToOriginal = ""
    }

    if (["review", "reassessment"].includes(values.type) && values.workflowId) {
      values.formId = ""
    }

    try {
      const res = await csrfFetch(`/api/workflows`, {
        method: "POST",
        body: JSON.stringify({
          ...values,
        }),
      })
      const workflow = await res.json()
      if (workflow.id) {
        push(`/workflows/${workflow.id}/confirm-personal-details`)
      }
    } catch (e) {
      setStatus(e.toString())
    }
  }

  const { data } = useWorkflowsByResident(query.social_care_id as string)

  const workflowChoices = getLinkableWorkflows(data?.workflows, forms)

  const [workflowType, setWorkflowType] = useState<string>("")

  return (
    <Layout
      title="Assessment type"
      breadcrumbs={[
        {
          href: process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL,
          text: "My workspace",
        },
        {
          href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/residents/${resident?.mosaicId}`,
          text: prettyResidentName(resident),
        },
        { current: true, text: "New workflow" },
      ]}
    >
      <fieldset>
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <h1 className="govuk-grid-column-two-thirds">
            <legend>Start a new workflow</legend>
          </h1>
        </div>

        <div className="govuk-grid-row">
          <Formik
            initialValues={{
              formId: "",
              workflowId: "",
              socialCareId: resident.mosaicId,
              linkToOriginal: "",
              type: "",
            }}
            onSubmit={handleSubmit}
            validationSchema={newWorkflowSchema(forms)}
          >
            {({ isSubmitting, touched, errors, values }) => (
              <Form className="govuk-grid-column-two-thirds">
                <FormStatusMessage />
                <p>What do you want to do?</p>
                <div
                  className={`govuk-radios lbh-radios govuk-form-group lbh-form-group ${
                    touched.type && errors.type && "govuk-form-group--error"
                  }`}
                >
                  <ErrorMessage name="type">
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

                  {workflowTypeOptions.map(workflowType => (
                    <div
                      className="govuk-radios__item"
                      key={workflowType.value}
                    >
                      <Field
                        type="radio"
                        name="type"
                        value={workflowType.value}
                        id={workflowType.value}
                        className="govuk-radios__input"
                        onClick={() => setWorkflowType(workflowType.value)}
                      />

                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor={workflowType.value}
                      >
                        {workflowType.label}
                      </label>
                    </div>
                  ))}
                </div>

                {(workflowType === "Assessment" ||
                  workflowType == "Review" ||
                  workflowType == "Reassessment") && (
                  <>
                    <SelectField
                      name="workflowId"
                      label={formLabels[workflowType].workflowId.label}
                      hint={formLabels[workflowType].workflowId.hint}
                      touched={touched}
                      errors={errors}
                      choices={workflowChoices}
                    />

                    {!values.workflowId &&
                      (workflowType == "Review" ||
                        workflowType == "Reassessment") && (
                        <>
                          <TextField
                            name="linkToOriginal"
                            label={
                              formLabels[workflowType].linkToOriginal.label
                            }
                            hint={formLabels[workflowType].linkToOriginal.hint}
                            touched={touched}
                            errors={errors}
                            className="govuk-input--width-20"
                            placeholder="https://"
                          />
                        </>
                      )}

                    {(workflowType == "Assessment" ||
                      ((workflowType == "Review" ||
                        workflowType == "Reassessment") &&
                        !values.workflowId)) && (
                      <>
                        <p>{formLabels[workflowType].formId.label}</p>
                        <span className="govuk-hint lbh-hint">
                          {formLabels[workflowType].formId.hint}
                        </span>

                        <div
                          className={`govuk-radios lbh-radios govuk-form-group lbh-form-group ${
                            touched.formId &&
                            errors.formId &&
                            "govuk-form-group--error"
                          }`}
                        >
                          <ErrorMessage name="formId">
                            {msg => (
                              <p
                                className="govuk-error-message lbh-error-message"
                                role="alert"
                              >
                                <span className="govuk-visually-hidden">
                                  Error:
                                </span>
                                {msg}
                              </p>
                            )}
                          </ErrorMessage>

                          {choices.map(choice => (
                            <div
                              className="govuk-radios__item"
                              key={choice.value}
                            >
                              <Field
                                type="radio"
                                name="formId"
                                value={choice.value}
                                id={choice.value}
                                className="govuk-radios__input"
                              />

                              <label
                                className="govuk-label govuk-radios__label"
                                htmlFor={choice.value}
                              >
                                {choice.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="govuk-button lbh-button"
                >
                  Continue
                </button>
              </Form>
            )}
          </Formik>

          <div className="govuk-grid-column-one-third">
            <ResidentWidget socialCareId={resident.mosaicId} />
          </div>
        </div>
      </fieldset>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = protectRoute(
  async ({ req, query }) => {
    const { social_care_id, form_id } = query

    // skip this page entirely if the right information is in the url
    if (social_care_id && form_id) {
      const newWorkflow: Workflow = await prisma.workflow.create({
        data: {
          socialCareId: social_care_id as string,
          formId: form_id as string,
          createdBy: req["user"]?.email,
          updatedBy: req["user"]?.email,
          assignedTo: req["user"]?.email,
        },
      })
      return {
        props: {},
        redirect: {
          destination: `/workflows/${newWorkflow.id}/confirm-personal-details`,
        },
      }
    }

    const resident = await getResidentById(social_care_id as string)

    // redirect if resident doesn't exist
    if (!resident)
      return {
        props: {},
        redirect: {
          destination: "/404",
        },
      }

    return {
      props: {
        resident,
        forms: await formsConfig(),
        workflowTypes: Object.values(WorkflowType),
      },
    }
  },
  [pilotGroup]
)

export default NewWorkflowPage
