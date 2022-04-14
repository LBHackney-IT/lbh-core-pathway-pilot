import Link from "next/link"
import { FlexibleAnswers as FlexibleAnswersT, Form, Status } from "../../../types"
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
import pick from "lodash.pick"
import { useMemo } from "react"
import AnswerFilters from "../../../components/AnswerFilters"
import useQueryState from "../../../hooks/useQueryState"
import LinkedWorkflowList from "../../../components/LinkedWorkflowList"
import useAnswerFilters from "../../../hooks/useAnswerFilters"
import { getStatus } from "../../../lib/status"

interface Props {
  workflow: WorkflowForMilestoneTimeline &
    WorkflowForNextStepsSummary & { comments: CommentWithCreator[] }
  forms: Form[]
}

const WorkflowPage = ({ workflow, forms }: Props): React.ReactElement => {
  const [filter, setFilter] = useQueryState<string>("filter", "")
  const { data: filters } = useAnswerFilters()

  const status = getStatus(workflow, null)
  const sentForApproval = status === Status.Submitted ||  status === Status.ManagerApproved || status === Status.NoAction || status === Status.ReviewSoon || status === Status.Overdue
  const workflowResidentSnapshot = workflow.resident;

  const answers = useMemo(() => {
    if (filter) {
      // 1. is there a valid matching filter?
      const answerFilter = filters?.answerFilters.find(
        filterOption => filterOption.id === filter
      )
      // 2. apply the filter
      if (answerFilter)
        return Object.entries(workflow.answers).reduce(
          (acc, [stepName, stepAnswers]) => {
            const trimmedStepAnswers = Object.fromEntries(
              Object.entries(stepAnswers).map(([key, value]) => {
                return [key.trim(), value]
              })
            )
            const filteredStepAnswers = pick(
              trimmedStepAnswers,
              answerFilter.answers[stepName]
            )
            if (Object.keys(filteredStepAnswers).length > 0)
              acc[stepName] = filteredStepAnswers
            return acc
          },
          {}
        )
    }
    // 3. if we got this far, just return everything
    return workflow.answers
  }, [filter, workflow.answers, filters?.answerFilters]) as FlexibleAnswersT

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
        <>
          <LinkedWorkflowList workflow={workflow} forms={forms} />
          <div className={s.timelineWrapper}>
            <MilestoneTimeline workflow={workflow} forms={forms} />
          </div>
        </>
      }
      mainContent={
        <>
          <Comments comments={workflow.comments} />
          <AnswerFilters filter={filter} setFilter={setFilter} />
          <NextStepsSummary workflow={workflow} />
          <ResidentDetailsCollapsible socialCareId={workflow.socialCareId} workflowId={workflow.id} showReducedView={sentForApproval && !workflowResidentSnap} />
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
        previousWorkflow: true,
        nextWorkflows: true,
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

    const allForms = await forms()

    return {
      props: {
        workflow: JSON.parse(
          JSON.stringify({
            ...workflow,
            form: allForms.find(form => form.id === workflow.formId),
          })
        ),
        forms: allForms,
      },
    }
  }
)

export default WorkflowPage
