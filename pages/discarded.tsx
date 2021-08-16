import Layout from "../components/_Layout"
import { Resident, WorkflowWithExtras } from "../types"
import { getWorkflows } from "../lib/serverQueries"
import { GetServerSideProps } from "next"
import { prettyResidentName } from "../lib/formatters"
import WorkflowPanel from "../components/WorkflowPanel"
import { getSession } from "next-auth/client"

interface Props {
  workflows: WorkflowWithExtras[]
  resident?: Resident
}

const IndexPage = ({ workflows, resident }: Props): React.ReactElement => {
  return (
    <Layout
      title={
        resident ? `Workflows | ${prettyResidentName(resident)}` : "Workflows"
      }
      breadcrumbs={[
        { href: "#", text: "Dashboard" },
        { href: "/", text: "Workflows" },
        { text: "Discarded workflows", current: true },
      ]}
    >
      <h1 className="govuk-!-margin-bottom-8">Discarded</h1>

      <>
        {workflows.length > 0 ? (
          workflows.map(result => (
            <WorkflowPanel key={result.id} workflow={result} />
          ))
        ) : (
          <p>No results</p>
        )}
      </>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req })

  // redirect if user isn't an approver
  if (!session.user.approver) {
    return {
      props: {},
      redirect: {
        destination: "/",
      },
    }
  }

  const workflows = await getWorkflows(undefined, undefined, undefined, true)

  return {
    props: {
      workflows: JSON.parse(JSON.stringify(workflows)),
    },
  }
}

export default IndexPage
