import { GetServerSideProps } from "next"
import Layout from "../components/_Layout"
import WorkflowList from "../components/WorkflowList"
import prisma from "../lib/prisma"
import { WorkflowWithCreator } from "../types"

interface Props {
  workflows: WorkflowWithCreator[]
}

const IndexPage = ({ workflows }: Props): React.ReactElement => {
  return (
    <Layout title="Dashboard">
      <h1 className="govuk-visually-hidden">Dashboard</h1>

      <h2>Work in progress</h2>

      <WorkflowList workflows={workflows} />
      <h2>Reviewable</h2>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const workflows = await prisma.workflow.findMany({
    where: {
      discardedAt: null,
    },
    include: {
      creator: true,
    },
  })

  return {
    props: {
      workflows: JSON.parse(JSON.stringify(workflows)),
    },
  }
}

export default IndexPage
