import Link from "next/link"
import {
  WorkflowWithExtras,
  FlexibleAnswers as FlexibleAnswersT,
} from "../../../../types"
import s from "../../../../styles/RevisionHistory.module.scss"
import { useRouter } from "next/router"
import FlexibleAnswers from "../../../../components/FlexibleAnswers/FlexibleAnswers"
import WorkflowOverviewLayout from "../../../../components/WorkflowOverviewLayout"
import RevisionList from "../../../../components/RevisionList"
import { GetServerSideProps } from "next"
import { getWorkflow } from "../../../../lib/serverQueries"

const WorkflowPage = (workflow: WorkflowWithExtras): React.ReactElement => {
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
        <FlexibleAnswers
          answers={revision.answers as FlexibleAnswersT}
          answersToCompare={workflow.answers as FlexibleAnswersT}
        />
      }
    />
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query

  const workflow = await getWorkflow(id as string, {
    creator: true,
    updater: true,
    nextReview: true,
    revisions: {
      include: {
        actor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
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

  return {
    props: {
      ...JSON.parse(JSON.stringify(workflow)),
    },
  }
}

export default WorkflowPage
