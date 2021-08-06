import { GetServerSideProps } from "next"
import ReviewOverviewLayout from "../../../../components/ReviewLayout"
import { AutosaveProvider } from "../../../../contexts/autosaveContext"
import { getWorkflow } from "../../../../lib/serverQueries"
import { WorkflowWithCreatorAssigneeAndRevisions } from "../../../../types"

const ReviewStepPage = (
  workflow: WorkflowWithCreatorAssigneeAndRevisions
): React.ReactElement => (
  <AutosaveProvider>
    <ReviewOverviewLayout workflow={workflow} />
  </AutosaveProvider>
)

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
