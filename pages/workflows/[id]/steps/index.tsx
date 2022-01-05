import AssignmentWidget from "../../../../components/AssignmentWidget"
import ResidentWidget from "../../../../components/ResidentWidget"
import TaskList from "../../../../components/TaskList"
import Layout from "../../../../components/_Layout"
import { Form, Status } from "../../../../types"
import s from "../../../../styles/Sidebar.module.scss"
import { totalStepsFromThemes } from "../../../../lib/taskList"
import { useMemo } from "react"
import { GetServerSideProps } from "next"
import PageAnnouncement from "../../../../components/PageAnnouncement"
import { prettyDateToNow, prettyResidentName } from "../../../../lib/formatters"
import Link from "next/link"
import { getStatus } from "../../../../lib/status"
import prisma from "../../../../lib/prisma"
import { Prisma } from "@prisma/client"
import forms from "../../../../config/forms"
import useResident from "../../../../hooks/useResident"
import { protectRoute } from "../../../../lib/protectRoute"
import { pilotGroup } from "../../../../config/allowedGroups"

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    previousWorkflow: true,
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
> & { form: Form }

interface Props {
  workflow: WorkflowWithRelations
}

const TaskListHeader = ({ workflow, totalSteps }) => {
  const status = getStatus(workflow)

  if (status !== Status.InProgress)
    return (
      <>
        <h2 className="lbh-heading-h3">
          {status === Status.Submitted ? "Submitted" : "Approved"}
        </h2>
        <p>
          This workflow has been{" "}
          {status === Status.Submitted ? "submitted for approval" : "approved"}.
          You can still make minor edits.
        </p>
        <Link href={`/workflows/${workflow.id}`}>
          <a className="govuk-button lbh-button govuk-button--secondary lbh-button--secondary">
            Return to overview
          </a>
        </Link>
      </>
    )

  const completedSteps = Object.keys(workflow.answers).length || 0
  if (completedSteps >= totalSteps)
    return (
      <>
        <h2 className="lbh-heading-h3">Ready to submit</h2>
        <p>You can now add next steps and submit to a manager for approval.</p>

        <Link href={`/workflows/${workflow.id}/finish`}>
          <a className="govuk-button lbh-button">Continue</a>
        </Link>
      </>
    )

  return (
    <>
      <h2 className="lbh-heading-h3">Submission incomplete</h2>
      <p>
        You&apos;ve completed {completedSteps} of {totalSteps} steps. Your
        changes will be saved automatically.
      </p>
    </>
  )
}

const TaskListPage = ({ workflow }: Props): React.ReactElement => {
  const title = workflow.form.name
  const totalSteps = useMemo(
    () => totalStepsFromThemes(workflow.form.themes),
    [workflow]
  )

  const status = getStatus(workflow)

  const { data: resident } = useResident(workflow.socialCareId)

  return (
    <Layout
      title={title}
      breadcrumbs={[
        {
          href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident?.mosaicId}`,
          text: prettyResidentName(resident),
        },
        { href: `/workflows/${workflow.id}`, text: "Workflow" },
        { current: true, text: "Task list" },
      ]}
    >
      {["Review", "Reassessment"].includes(workflow.type) && (
        <PageAnnouncement
          title={`This is ${
            workflow.workflowId ? "a reassessment" : "an unlinked reassessment"
          }`}
          className="lbh-page-announcement--info"
        >
          {workflow.workflowId && (
            <>
              You can copy answers that haven&apos;t changed from the last
              assessment, which was{" "}
              {prettyDateToNow(String(workflow?.previousReview?.updatedAt))}.
            </>
          )}
          {workflow.linkToOriginal && (
            <>
              You can refer to the{" "}
              <Link href={workflow.linkToOriginal}>original workflow</Link>.
            </>
          )}
        </PageAnnouncement>
      )}

      <div className="govuk-grid-row govuk-!-margin-bottom-8">
        <div className="govuk-grid-column-two-thirds">
          <h1>{title}</h1>
        </div>
      </div>
      <div className={`govuk-grid-row ${s.outer}`}>
        <div className="govuk-grid-column-two-thirds">
          <TaskListHeader workflow={workflow} totalSteps={totalSteps} />
          <TaskList workflow={workflow} />
        </div>
        <div className="govuk-grid-column-one-third">
          <div className={s.sticky}>
            <AssignmentWidget workflowId={workflow.id} status={status} />
            <ResidentWidget socialCareId={workflow.socialCareId} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = protectRoute(
  async ({ query, req }) => {
    const { id } = query

    const workflow = await prisma.workflow.findUnique({
      where: {
        id: id as string,
      },
      include: {
        previousWorkflow: true,
      },
    })
    const form = (await forms()).find(form => form.id === workflow.formId)

    // redirect if workflow or form doesn't exist
    if (!workflow || !form)
      return {
        props: {},
        redirect: {
          destination: "/404",
        },
      }

    // redirect if workflow is not in progress and user is not an approver
    const status = getStatus(workflow)
    // 1. is the workflow NOT in progress?
    if (status !== Status.InProgress) {
      // 2a. is the workflow submitted AND is the user an approver?
      // 2b. is the workflow manager approved AND is the user a panel approver?
      if (
        !(status === Status.Submitted && req["user"].approver) &&
        !(status === Status.ManagerApproved && req["user"].panelApprover)
      )
        return {
          props: {},
          redirect: {
            destination: `/workflows/${workflow.id}`,
          },
        }
    }

    return {
      props: {
        workflow: JSON.parse(
          JSON.stringify({
            ...workflow,
            form,
          })
        ),
      },
    }
  },
  [pilotGroup]
)

export default TaskListPage
