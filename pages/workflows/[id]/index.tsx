import Link from "next/link"
import { FlexibleAnswers as FlexibleAnswersT } from "../../../types"
import s from "../../../styles/LeftSidebar.module.scss"
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
import { protectRoute } from "../../../lib/protectRoute"
import answerFilters from "../../../config/answerFilters"
import pick from "lodash.pick"
import { useMemo } from "react"
import AnswerFilters from "../../../components/AnswerFilters"
import useQueryState from "../../../hooks/useQueryState"

const WorkflowPage = (
  workflow: WorkflowForMilestoneTimeline &
    WorkflowForNextStepsSummary & { comments: CommentWithCreator[] }
): React.ReactElement => {
  const [filter, setFilter] = useQueryState<string>("filter", "")

  const answers = useMemo(() => {
    if (filter) {
      // 1. is there a valid matching filter?
      const answerFilter = answerFilters.find(
        filterOption =>
          filterOption.id === filter && workflow.formId === filterOption.formId
      )
      // 2. apply the filter
      if (answerFilter)
        return Object.entries(workflow.answers).reduce(
          (acc, [stepName, stepAnswers]) => {
            const filteredStepAnswers = pick(
              stepAnswers,
              answerFilter.answers[stepName]
            )
            // 2a. ignore empty steps
            if (Object.keys(filteredStepAnswers).length > 0)
              acc[stepName] = filteredStepAnswers
            return acc
          },
          {}
        )
    }
    // 3. if we got this far, just return everything
    return workflow.answers
  }, [filter, workflow.answers, workflow.formId]) as FlexibleAnswersT

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
          <AnswerFilters
            filter={filter}
            setFilter={setFilter}
            formId={workflow.formId}
          />
          <NextStepsSummary workflow={workflow} />
          <ResidentDetailsCollapsible socialCareId={workflow.socialCareId} />
          <FlexibleAnswers answers={answers} form={workflow.form} />
        </>
      }
      // footer={}
    />
  )
}

export const getServerSideProps: GetServerSideProps = protectRoute(
  async ({ query }) => {
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
        acknowledger: true,
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
)

export default WorkflowPage
