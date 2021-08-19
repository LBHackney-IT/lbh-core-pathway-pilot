import Link from "next/link"
import {
  FlexibleAnswers as FlexibleAnswersT,
  WorkflowWithExtras,
} from "../../../types"
import s from "../../../styles/RevisionHistory.module.scss"
import MilestoneTimeline from "../../../components/MilestoneTimeline"
import FlexibleAnswers from "../../../components/FlexibleAnswers/FlexibleAnswers"
import WorkflowOverviewLayout from "../../../components/WorkflowOverviewLayout"
import { GetServerSideProps } from "next"
import { getWorkflow } from "../../../lib/serverQueries"

const WorkflowPage = (workflow: WorkflowWithExtras): React.ReactElement => {
  console.log(workflow)
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
        <FlexibleAnswers
          answers={workflow.answers as FlexibleAnswersT}
          form={workflow.form}
        />
      }
    />
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query

  const workflow = await getWorkflow(id as string, {
    creator: true,
    assignee: true,
    updater: true,
    managerApprover: true,
    panelApprover: true,
    discarder: true,
    submitter: true,
    previousReview: true,
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

  console.log(workflow)

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
