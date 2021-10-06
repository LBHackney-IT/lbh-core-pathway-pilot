import Link from "next/link"
import { FlexibleAnswers as FlexibleAnswersT } from "../../../types"
import s from "../../../styles/RevisionHistory.module.scss"
import MilestoneTimeline, {
  WorkflowForMilestoneTimeline,
} from "../../../components/MilestoneTimeline"
import FlexibleAnswers from "../../../components/FlexibleAnswers/FlexibleAnswers"
import WorkflowOverviewLayout from "../../../components/WorkflowOverviewLayout"
import { GetServerSideProps } from "next"
import prisma from "../../../lib/prisma"
import forms from "../../../config/forms"
import NextStepsSummary, {
  WorkflowForNextStepsSummary,
} from "../../../components/NextStepsSummary"
import Comments, { CommentWithCreator } from "../../../components/Comments"
import ResidentDetailsCollapsible from "../../../components/ResidentDetailsCollapsible"

const WorkflowPage = (
  workflow: WorkflowForMilestoneTimeline &
    WorkflowForNextStepsSummary & { comments: CommentWithCreator[] }
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
        <>
          <Comments comments={workflow.comments} />
          <NextStepsSummary workflow={workflow} />
          <ResidentDetailsCollapsible socialCareId={workflow.socialCareId} />
          <FlexibleAnswers
            answers={workflow.answers as FlexibleAnswersT}
            form={workflow.form}
          />
        </>
      }
      // footer={}
    />
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: id as string,
    },
    include: {
      creator: true,
      assignee: true,
      updater: true,
      managerApprover: true,
      panelApprover: true,
      discarder: true,
      submitter: true,
      previousReview: true,
      nextReview: true,
      nextSteps: true,
      comments: {
        include: {
          creator: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      revisions: {
        include: {
          actor: true,
        },
        orderBy: {
          createdAt: "desc",
        },
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
      ...JSON.parse(
        JSON.stringify({
          ...workflow,
          form: (await forms()).find(form => form.id === workflow.formId),
        })
      ),
    },
  }
}

export default WorkflowPage
