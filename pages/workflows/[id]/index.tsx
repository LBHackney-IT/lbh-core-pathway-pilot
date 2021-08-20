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

const WorkflowPage = (
  workflow: WorkflowForMilestoneTimeline
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
          form: forms.find(form => form.id === workflow.formId),
        })
      ),
    },
  }
}

export default WorkflowPage
