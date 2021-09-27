import Layout from "../components/_Layout"
import { Resident } from "../types"
import { GetServerSideProps } from "next"
import WorkflowPanel, { WorkflowForPanel } from "../components/WorkflowPanel"
import { getSession } from "next-auth/client"
import prisma from "../lib/prisma"
import forms from "../config/forms"

interface Props {
  workflows: WorkflowForPanel[]
  resident?: Resident
}

const IndexPage = ({ workflows }: Props): React.ReactElement => {
  return (
    <Layout
      title="Closed workflows"
      breadcrumbs={[
        {
          href: process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL,
          text: "My workspace",
        },
        { href: "/", text: "Workflows" },
        { text: "Closed workflows", current: true },
      ]}
    >
      <h1 className="govuk-!-margin-bottom-8">Closed</h1>

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

  const workflows = await prisma.workflow.findMany({
    where: {
      discardedAt: { not: null },
    },
    include: { creator: true, assignee: true, nextReview: true },
  });

  const resolvedForms = await forms();

  return {
    props: {
      workflows: JSON.parse(
        JSON.stringify(
          workflows.map(workflow => ({
            ...workflow,
            form: resolvedForms.find(form => form.id === workflow.formId),
          }))
        )
      ),
    },
  }
}

export default IndexPage
