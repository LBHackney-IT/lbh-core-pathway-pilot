import { Workflow } from "@prisma/client"
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
      <h1>{title}</h1>
    </Layout>
  )
}

export const getServerSideProps = getWorkflowServerSide

export default TaskListPage
