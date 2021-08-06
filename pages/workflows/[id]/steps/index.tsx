import AssigneeWidget from "../../../../components/AssignmentWidget"
import ResidentWidget from "../../../../components/ResidentWidget"
import TaskList from "../../../../components/TaskList"
import Layout from "../../../../components/_Layout"
import { ReviewWithCreatorAndAssignee } from "../../../../types"
import s from "../../../../styles/Sidebar.module.scss"
import { buildThemes, totalStepsFromThemes } from "../../../../lib/taskList"
import { useMemo } from "react"
import { GetServerSideProps } from "next"
import { getWorkflow } from "../../../../lib/serverQueries"

const TaskListPage = (
  workflow: ReviewWithCreatorAndAssignee
): React.ReactElement => {
  const title = workflow.workflowId
    ? "Review of assessment and support plan"
    : workflow.type === "Full"
    ? "Assessment and support plan"
    : "Initial screening assessment"

  const totalSteps = useMemo(
    () => totalStepsFromThemes(buildThemes(workflow)),
    [workflow]
  )

  return (
    <Layout
      title={title}
      breadcrumbs={[
        { href: "/", text: "Dashboard" },
        { href: `/workflows/${workflow.id}`, text: "Workflow" },
        { current: true, text: "Task list" },
      ]}
    >
      <div className="govuk-grid-row govuk-!-margin-bottom-8">
        <div className="govuk-grid-column-two-thirds">
          <h1>{title}</h1>
        </div>
      </div>
      <div className={`govuk-grid-row ${s.outer}`}>
        <div className="govuk-grid-column-two-thirds">
          <h2 className="lbh-heading-h3">Submission incomplete</h2>
          <p>
            You&apos;ve completed {Object.keys(workflow.answers).length || "0"}{" "}
            of {totalSteps} steps.
          </p>
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

export default TaskListPage
