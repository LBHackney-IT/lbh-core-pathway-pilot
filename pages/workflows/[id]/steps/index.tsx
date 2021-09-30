import AssigneeWidget from "../../../../components/AssignmentWidget"
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

const workflowWithRelations = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    previousReview: true,
  },
})
type WorkflowWithRelations = Prisma.WorkflowGetPayload<
  typeof workflowWithRelations
> & { form: Form }

const TaskListHeader = ({ workflow, totalSteps }) => {
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

const TaskListPage = (workflow: WorkflowWithRelations): React.ReactElement => {
  const title = workflow.form.name
  const totalSteps = useMemo(
    () => totalStepsFromThemes(workflow.form.themes),
    [workflow]
  )

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
          title={`This is a ${workflow.type.toLowerCase()}`}
          className="lbh-page-announcement--info"
        >
          You can copy answers that haven&apos;t changed from the last
          assessment, which was{" "}
          {prettyDateToNow(String(workflow?.previousReview?.updatedAt))}.
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
            <AssigneeWidget workflowId={workflow.id} />
            <ResidentWidget socialCareId={workflow.socialCareId} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: id as string,
    },
    include: {
      previousReview: true,
    },
  })
  const form = (await forms()).find(form => form.id === workflow.formId)

  // redirect if workflow doesn't exist
  if (!workflow)
    return {
      props: {},
      redirect: {
        destination: "/404",
      },
    }

  // redirect if workflow is not in progress or if form doesn't exists
  if (getStatus(workflow) !== Status.InProgress || !form)
    return {
      props: {},
      redirect: {
        destination: `/workflows/${workflow.id}`,
      },
    }

  return {
    props: {
      ...JSON.parse(
        JSON.stringify({
          ...workflow,
          form,
        })
      ),
    },
  }
}

export default TaskListPage
