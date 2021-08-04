import Link from "next/link"
import { getWorkflowWithRevisionsServerSide } from "../../../../lib/serverSideProps"
import {
  WorkflowWithCreatorAssigneeUpdaterAndRevisions,
  FlexibleAnswers as FlexibleAnswersT,
} from "../../../../types"
import s from "../../../../styles/RevisionHistory.module.scss"
import { useRouter } from "next/router"
import FlexibleAnswers from "../../../../components/FlexibleAnswers/FlexibleAnswers"
import WorkflowOverviewLayout from "../../../../components/WorkflowOverviewLayout"
import RevisionList from "../../../../components/RevisionList"

const WorkflowPage = (
  workflow: WorkflowWithCreatorAssigneeUpdaterAndRevisions
): React.ReactElement => {
  const { query } = useRouter()

  const revision = workflow?.revisions.find(
    revision => revision.id === query.revisionId
  )

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
      sidebar={
        <RevisionList workflow={workflow} selectedRevisionId={revision.id} />
      }
      mainContent={
        <FlexibleAnswers answers={revision.answers as FlexibleAnswersT} />
      }
    />
  )
}

export const getServerSideProps = getWorkflowWithRevisionsServerSide

export default WorkflowPage
