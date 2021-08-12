import Layout from "../components/_Layout"
import WorkflowList from "../components/WorkflowList"
import { WorkflowWithCreatorAndAssignee } from "../types"
import { getWorkflows } from "../lib/serverQueries"
import { GetServerSideProps } from "next"

interface Props {
  workflows: WorkflowWithCreatorAndAssignee[]
}

const IndexPage = ({ workflows }: Props): React.ReactElement => {
  return (
    <Layout title="Dashboard">
      <h1 className="govuk-visually-hidden">Dashboard</h1>

      <h2>Work in progress</h2>
      <WorkflowList workflows={workflows} />
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const workflows = await getWorkflows()

  return {
    props: {
      workflows: JSON.parse(JSON.stringify(workflows)),
    },
  }
}

export default IndexPage
