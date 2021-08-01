import { Workflow } from "@prisma/client"
import { GetServerSideProps } from "next"
import Layout from "../../../components/_Layout"
import prisma from "../../../lib/prisma"

const WorkflowPage = (workflow: Workflow): React.ReactElement => {
  return (
    <Layout
      title="Are the personal details correct?"
      breadcrumbs={[
        { href: "/", text: "Home" },
        { text: "Workflow", current: true },
      ]}
    >
      <h1>Workflow details</h1>
      {JSON.stringify(workflow)}
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

export default WorkflowPage
