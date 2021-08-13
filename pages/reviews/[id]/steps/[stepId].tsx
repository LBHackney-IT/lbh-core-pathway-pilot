import { GetServerSideProps } from "next"
import ReviewOverviewLayout from "../../../../components/ReviewLayout"
import { AutosaveProvider } from "../../../../contexts/autosaveContext"
import { getWorkflow } from "../../../../lib/serverQueries"
import { WorkflowWithExtras } from "../../../../types"
import { useRouter } from "next/router"
import { allSteps } from "../../../../config/forms"

const ReviewStepPage = (workflow: WorkflowWithExtras): React.ReactElement => {
  const { query } = useRouter()

  const step = allSteps.find(step => step.id === query.stepId)

  return (
    <AutosaveProvider>
      <ReviewOverviewLayout workflow={workflow} step={step} />
    </AutosaveProvider>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id, stepId } = query

  const workflow = await getWorkflow(id as string, false, true)

  // redirect if workflow doesn't exist
  if (!workflow)
    return {
      props: {},
      redirect: {
        destination: "/404",
      },
    }

  // redirect if workflow is not a review
  if (!workflow.workflowId)
    return {
      props: {},
      redirect: {
        destination: `/workflows/${workflow.id}/steps/${stepId}`,
      },
    }

  return {
    props: {
      ...JSON.parse(JSON.stringify(workflow)),
    },
  }
}

export default ReviewStepPage
