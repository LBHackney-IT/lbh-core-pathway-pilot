import Link from "next/link"
import { getWorkflowWithRevisionsServerSide } from "../../../lib/serverSideProps"
import {
  FlexibleAnswers as FlexibleAnswersT,
  WorkflowWithCreatorAssigneeAndRevisions,
} from "../../../types"
import s from "../../../styles/RevisionHistory.module.scss"
import MilestoneTimeline from "../../../components/MilestoneTimeline"
import FlexibleAnswers from "../../../components/FlexibleAnswers/FlexibleAnswers"
import WorkflowOverviewLayout from "../../../components/WorkflowOverviewLayout"

const WorkflowPage = (
  workflow: WorkflowWithCreatorAssigneeAndRevisions
): React.ReactElement => {
  return (
    <WorkflowOverviewLayout
      workflow={workflow}
      nav={
        <ul>
          <li className={s.tab} aria-current={true}>
            Milestones
          </li>
          <li className={s.tab}>
            <Link scroll={false} href={`/workflows/${workflow.id}/revisions`}>
              Revisions
            </Link>
          </li>
        </ul>
      }
      sidebar={
        <div className={s.timelineWrapper}>
          <MilestoneTimeline workflow={workflow} />
        </div>
      }
      mainContent={
        <FlexibleAnswers answers={workflow.answers as FlexibleAnswersT} />
      }
    />
  )
}

export const getServerSideProps = getWorkflowWithRevisionsServerSide

export default WorkflowPage
