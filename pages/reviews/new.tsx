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
import { Prisma, WorkflowType } from "@prisma/client"
import { csrfFetch } from "../../lib/csrfToken"
import { protectRoute } from "../../lib/protectRoute"
import { pilotGroup } from "../../config/allowedGroups"

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    nextWorkflows: true,
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
>

export const NewReviewPage = (
  workflow: WorkflowWithRelations
): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)
  const { push, query } = useRouter()

  const isUnlinkedReassessment = query["unlinked_reassessment"] === "true"

  const handleSubmit = async (values, { setStatus }) => {
    try {
      let res
      if (isUnlinkedReassessment) {
        res = await csrfFetch(`/api/workflows/${workflow.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            answers: {
              Reassessment: values,
            },
          }),
        })
      } else {
        res = await csrfFetch(`/api/workflows`, {
          method: "POST",
          body: JSON.stringify({
            formId: workflow.formId,
            socialCareId: workflow.socialCareId,
            workflowId: workflow.id,
            type: WorkflowType.Reassessment,
            answers: {
              Reassessment: values,
            },
          }),
        })
      }

      const reassessment = await res.json()
      if (reassessment.error) throw reassessment.error
      if (reassessment.id) push(`/workflows/${reassessment.id}/steps`)
    } catch (e) {
      setStatus(e.toString())
    }
  }

  const breadcrumbs = [
    {
      href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident?.mosaicId}`,
      text: prettyResidentName(resident),
    },
  ]

  if (!isUnlinkedReassessment)
    breadcrumbs.push({
      href: `/workflows/${workflow.id}`,
      text: "Workflow",
    })

  return (
    <Layout
      title="Reassess a workflow"
      breadcrumbs={[...breadcrumbs, { current: true, text: "Reassess" }]}
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
                  type="submit"
                  disabled={isSubmitting}
                  className="govuk-button lbh-button"
                >
                  Continue to task list
                </button>
              </Form>
            )}
          </Formik>
        </div>

        <div className="govuk-grid-column-one-third">
          <ResidentWidget socialCareId={workflow.socialCareId} />
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = protectRoute(
  async ({ query }) => {
    const { id } = query

    const workflow = await prisma.workflow.findUnique({
      where: {
        id: id as string,
      },
      include: {
        nextWorkflows: true,
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

    // if the workflow bas already been reviewed, go there instead
    const reassessment = workflow.nextWorkflows.find(
      w => w.type === WorkflowType.Reassessment
    )
    if (reassessment)
      return {
        props: {},
        redirect: {
          destination: `/workflows/${reassessment.id}`,
        },
      }

    return {
      props: {
        ...JSON.parse(JSON.stringify(workflow)),
      },
    }
  },
  [pilotGroup]
)

export default NewReviewPage
