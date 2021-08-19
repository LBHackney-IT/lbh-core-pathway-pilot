import { FormikHelpers, FormikValues } from "formik"
import { useRouter } from "next/router"
import AssignmentWidget from "../../../../components/AssignmentWidget"
import StepForm from "../../../../components/FlexibleForms/StepForm"
import ResidentWidget from "../../../../components/ResidentWidget"
import Layout from "../../../../components/_Layout"
import { allSteps } from "../../../../config/forms"
import {
  AutosaveIndicator,
  AutosaveProvider,
} from "../../../../contexts/autosaveContext"
import { generateInitialValues } from "../../../../lib/utils"
import { Status, WorkflowWithExtras } from "../../../../types"
import s from "../../../../styles/Sidebar.module.scss"
import { GetServerSideProps } from "next"
import { getWorkflow } from "../../../../lib/serverQueries"
import { getStatus } from "../../../../lib/status"

const StepPage = (workflow: WorkflowWithExtras): React.ReactElement => {
  const { query } = useRouter()

  const step = allSteps.find(step => step.id === query.stepId)
  const answers = workflow.answers?.[step.id]

  const handleSubmit = async (
    values: FormikValues,
    { setStatus }: FormikHelpers<FormikValues>
  ): Promise<void> => {
    try {
      const res = await fetch(
        `/api/workflows/${workflow.id}/steps/${step.id}`,
        {
          body: JSON.stringify(values),
          method: "PATCH",
        }
      )
      const data = await res.json()
      if (data.error) throw data.error
    } catch (e) {
      setStatus(e.toString())
    }
  }

  return (
    <AutosaveProvider>
      <Layout
        title={step.name}
        breadcrumbs={[
          { href: "/", text: "Dashboard" },
          { href: `/workflows/${workflow.id}`, text: "Workflow" },
          { href: `/workflows/${workflow.id}/steps`, text: "Task list" },
          { current: true, text: step.name },
        ]}
      >
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-two-thirds">
            <h1>{step.name}</h1>
          </div>
        </div>
        <div className={`govuk-grid-row ${s.outer}`}>
          <div className="govuk-grid-column-two-thirds">
            {step?.intro && <p>{step.intro}</p>}
            <StepForm
              onSubmit={handleSubmit}
              fields={step.fields}
              initialValues={answers || generateInitialValues(step.fields)}
            />
          </div>
          <div className="govuk-grid-column-one-third">
            <div className={s.sticky}>
              <AutosaveIndicator />
              <AssignmentWidget workflowId={workflow.id} />
              <ResidentWidget socialCareId={workflow.socialCareId} />
            </div>
          </div>
        </div>
      </Layout>
    </AutosaveProvider>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id, stepId } = query

  const workflow = await getWorkflow(id as string)

  // redirect if workflow doesn't exist
  if (!workflow)
    return {
      props: {},
      redirect: {
        destination: "/404",
      },
    }

  // redirect if workflow is not in progress
  if (getStatus(workflow) !== Status.InProgress)
    return {
      props: {},
      redirect: {
        destination: `/workflow/${workflow.id}`,
      },
    }

  // redirect if workflow is a review
  if (workflow.workflowId)
    return {
      props: {},
      redirect: {
        destination: `/reviews/${workflow.id}/steps/${stepId}`,
      },
    }

  return {
    props: {
      ...JSON.parse(JSON.stringify(workflow)),
    },
  }
}

export default StepPage
