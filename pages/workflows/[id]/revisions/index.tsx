import Link from "next/link"
import {
  WorkflowWithCreatorAssigneeUpdaterAndRevisions,
  FlexibleAnswers as FlexibleAnswersT,
} from "../../../../types"
import s from "../../../../styles/RevisionHistory.module.scss"
import FlexibleAnswers from "../../../../components/FlexibleAnswers/FlexibleAnswers"
import WorkflowOverviewLayout from "../../../../components/WorkflowOverviewLayout"
import RevisionList from "../../../../components/RevisionList"
import { getWorkflow } from "../../../../lib/serverQueries"
import { GetServerSideProps } from "next"

const WorkflowPage = (
  workflow: WorkflowWithCreatorAssigneeUpdaterAndRevisions
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
        <FlexibleAnswers answers={workflow.answers as FlexibleAnswersT} form={workflow.form} />
      }
    />
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query

  const workflow = await getWorkflow(id as string, true)

  // redirect if workflow doesn't exist
  if (!workflow)
    return {
      props: {},
      redirect: {
        destination: "/404",
      },
    }

  return {
    props: {
      ...JSON.parse(JSON.stringify(workflow)),
    },
  }
}

export default WorkflowPage
