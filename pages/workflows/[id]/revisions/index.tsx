import Link from "next/link"
import { getWorkflowWithRevisionsServerSide } from "../../../../lib/serverSideProps"
import {
  WorkflowWithCreatorAssigneeAndRevisions,
  FlexibleAnswers as FlexibleAnswersT,
} from "../../../../types"
import s from "../../../../styles/RevisionHistory.module.scss"
import FlexibleAnswers from "../../../../components/FlexibleAnswers/FlexibleAnswers"
import WorkflowOverviewLayout from "../../../../components/WorkflowOverviewLayout"
import RevisionList from "../../../../components/RevisionList"

const WorkflowPage = (
  workflow: WorkflowWithCreatorAssigneeAndRevisions
): React.ReactElement => {
  return (
    <WorkflowOverviewLayout
      workflow={workflow}
      nav={
        <ul>
          <li className={s.tab}>
            <Link scroll={false} href={`/workflows/${workflow.id}/`}>
              Milestones
            </Link>
          </li>
          <li className={s.tab} aria-current={true}>
            Revisions
          </li>
        </ul>
      }
      sidebar={<RevisionList workflow={workflow} />}
      mainContent={
        <FlexibleAnswers answers={workflow.answers as FlexibleAnswersT} />
      }
    />
  )
}

export const getServerSideProps = getWorkflowWithRevisionsServerSide

export default WorkflowPage
