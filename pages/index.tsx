import { Workflow } from "@prisma/client"
import { GetServerSideProps } from "next"
import WorkflowPanel from "../components/WorkflowPanel"
import prisma from "../lib/prisma"
import Layout from "../components/_Layout"
import WorkflowList from "../components/WorkflowList"

interface Props {
  workflows: Workflow[]
}

const IndexPage = ({ workflows }: Props): React.ReactElement => {
  return (
    <Layout
      title="Dashboard"
      breadcrumbs={[
        {
          href: "/jjj",
          text: "Blah",
        },
        {
          href: "/jjll",
          text: "Foo",
          current: true,
        },
      ]}
    >
      <h1 className="govuk-visually-hidden">Dashboard</h1>

      <h2>Work in progress</h2>
      <WorkflowList>
        {workflows.length > 0 ? (
          workflows.map(workflow => (
            <WorkflowPanel key={workflow.id} workflow={workflow} />
          ))
        ) : (
          <p>No results to show</p>
        )}
      </WorkflowList>
      <h2>Reviewable</h2>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const workflows = await prisma.workflow.findMany()

  return {
    props: { workflows },
  }
}

export default IndexPage
