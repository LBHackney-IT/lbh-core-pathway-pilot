import Layout from "../../components/_Layout"
import useResident from "../../hooks/useResident"
import { useRouter } from "next/router"
import { GetServerSideProps } from "next"
import { getWorkflow } from "../../lib/serverQueries"
import { WorkflowWithExtras } from "../../types"
import { Form, Formik } from "formik"
import reviewFields from "../../config/forms/review"
import FlexibleField from "../../components/FlexibleForms/FlexibleFields"
import { generateInitialValues } from "../../lib/utils"
import { generateFlexibleSchema } from "../../lib/validators"
import ResidentWidget from "../../components/ResidentWidget"
import FormStatusMessage from "../../components/FormStatusMessage"
import { prettyResidentName } from "../../lib/formatters"

const willReassess = (values): boolean => {
  if (values["Reassessment needed?"] === "Yes") return true
  if (values["Changes to support plan needed?"] === "Yes") return true
  return false
}

const NewReviewPage = (
  previousWorkflow: WorkflowWithExtras
): React.ReactElement => {
  const { data: resident } = useResident(previousWorkflow.socialCareId)
  const { push } = useRouter()

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const res = await fetch(`/api/workflows`, {
        method: "POST",
        body: JSON.stringify({
          formId: previousWorkflow.formId,
          socialCareId: previousWorkflow.socialCareId,
          workflowId: previousWorkflow.id,
          type: willReassess(values) ? "Reassessment" : "Review",
          answers: {
            Review: values,
          },
        }),
      })
      const workflow = await res.json()
      if (workflow.error) throw workflow.error
      if (workflow.id)
        willReassess(values)
          ? push(`/workflows/${workflow.id}/steps`)
          : push(`/`)
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <Layout
      title="Review a workflow"
      breadcrumbs={[
        { href: "/", text: "Dashboard" },
        {
          href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident?.mosaicId}`,
          text: prettyResidentName(resident),
        },
        { current: true, text: "Review a workflow" },
      ]}
    >
      <div className="govuk-grid-row govuk-!-margin-bottom-8">
        <div className="govuk-grid-column-two-thirds">
          <h1>Start a review</h1>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <Formik
            initialValues={generateInitialValues(reviewFields)}
            onSubmit={handleSubmit}
            validationSchema={generateFlexibleSchema(reviewFields)}
          >
            {({ errors, touched, values, isSubmitting }) => (
              <Form>
                <FormStatusMessage />

                {reviewFields.map(field => (
                  <FlexibleField
                    key={field.id}
                    errors={errors}
                    touched={touched}
                    values={values}
                    field={field}
                  />
                ))}

                <button
                  disabled={isSubmitting}
                  className="govuk-button lbh-button"
                >
                  {willReassess(values)
                    ? "Continue to reassessment"
                    : "Finish and send"}
                </button>
              </Form>
            )}
          </Formik>
        </div>

        <div className="govuk-grid-column-one-third">
          <ResidentWidget socialCareId={previousWorkflow.socialCareId} />
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query

  const previousWorkflow = await getWorkflow(id as string, true)

  // redirect if workflow doesn't exist
  if (!previousWorkflow)
    return {
      props: {},
      redirect: {
        destination: "/404",
      },
    }

  return {
    props: {
      ...JSON.parse(JSON.stringify(previousWorkflow)),
    },
  }
}

export default NewReviewPage
