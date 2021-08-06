import ReviewOverviewLayout from "../../../../components/ReviewLayout"
import { AutosaveProvider } from "../../../../contexts/autosaveContext"
import { getWorkflowServerSide } from "../../../../lib/serverSideProps"
import { WorkflowWithCreatorAssigneeAndRevisions } from "../../../../types"

const ReviewStepPage = (
  workflow: WorkflowWithCreatorAssigneeAndRevisions
): React.ReactElement => (
  <AutosaveProvider>
    <ReviewOverviewLayout workflow={workflow} />
  </AutosaveProvider>
)

export const getServerSideProps = getWorkflowServerSide

export default ReviewStepPage
