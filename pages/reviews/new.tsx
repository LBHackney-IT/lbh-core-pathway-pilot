import Layout from "../../components/_Layout"
import useResident from "../../hooks/useResident"
import { useRouter } from "next/router"
import { GetServerSideProps } from "next"
import { Form, Formik } from "formik"
import reviewFields from "../../config/forms/review"
import FlexibleField from "../../components/FlexibleForms/FlexibleFields"
import { generateInitialValues } from "../../lib/forms"
import { generateFlexibleSchema } from "../../lib/validators"
import ResidentWidget from "../../components/ResidentWidget"
import FormStatusMessage from "../../components/FormStatusMessage"
import { prettyResidentName } from "../../lib/formatters"
import prisma from "../../lib/prisma"
import { Prisma } from "@prisma/client"

const willReassess = (values): boolean => {
  if (values["Reassessment needed?"] === "Yes") return true
  if (values["Changes to support plan needed?"] === "Yes") return true
  return false
}

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    nextReview: true,
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
>

const NewReviewPage = (
  previousWorkflow: WorkflowWithRelations
): React.ReactElement => {
  const { data: resident } = useResident(previousWorkflow.socialCareId)
  const { push } = useRouter()

  const handleSubmit = async (values, { setStatus }) => {
    try {
      const reassessment = willReassess(values)
      // include the answers from the previous workflow, conditionally
      const newAnswers = reassessment ? {} : previousWorkflow.answers
      newAnswers["Review"] = values
      const res = await fetch(`/api/workflows`, {
        method: "POST",
        body: JSON.stringify({
          formId: previousWorkflow.formId,
          socialCareId: previousWorkflow.socialCareId,
          workflowId: previousWorkflow.id,
          type: reassessment ? "Reassessment" : "Review",
          answers: newAnswers,
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
      title="Reassess a workflow"
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
          <h1>Start a reassessment</h1>
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

  const previousWorkflow = await prisma.workflow.findUnique({
    where: {
      id: id as string,
    },
    include: {
      nextReview: true,
    },
  })

  // redirect if workflow doesn't exist
  if (!previousWorkflow)
    return {
      props: {},
      redirect: {
        destination: "/404",
      },
    }

  // if the workflow bas already been reviewed, go there instead
  if (previousWorkflow.nextReview)
    return {
      props: {},
      redirect: {
        destination: `/workflows/${previousWorkflow.nextReview.id}`,
      },
    }

  return {
    props: {
      ...JSON.parse(JSON.stringify(previousWorkflow)),
    },
  }
}

export default NewReviewPage
