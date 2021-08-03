import Layout from "../components/_Layout"
import WorkflowList from "../components/WorkflowList"
import { WorkflowWithCreatorAndAssignee } from "../types"
import { getWorkflowsServerSide } from "../lib/serverSideProps"

interface Props {
  workflows: WorkflowWithCreatorAndAssignee[]
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

export const getServerSideProps = getWorkflowsServerSide

export default IndexPage
