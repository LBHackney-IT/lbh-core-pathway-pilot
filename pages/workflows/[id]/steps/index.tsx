import { Workflow } from "@prisma/client"
import ResidentWidget from "../../../../components/ResidentWidget"
import Layout from "../../../../components/_Layout"
import { getWorkflowServerSide } from "../../../../lib/serverSideProps"

const TaskListPage = (workflow: Workflow): React.ReactElement => {
  const title =
    workflow.type === "Full"
      ? "Assessment and support plan"
      : "Initial screening assessment"

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
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">test</div>
        <div className="govuk-grid-column-one-third">
          <ResidentWidget socialCareId={workflow.socialCareId} />
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps = getWorkflowServerSide

export default TaskListPage
