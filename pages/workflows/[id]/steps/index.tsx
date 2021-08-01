import { Workflow } from "@prisma/client"
import { GetServerSideProps } from "next"
import Layout from "../../../../components/_Layout"
import prisma from "../../../../lib/prisma"

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

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { id } = params

  const workflow = await prisma.workflow.findUnique({
    where: { id: id as string },
  })

  return {
    props: {
      ...JSON.parse(JSON.stringify(workflow)),
    },
  }
}

export default TaskListPage
