import Layout from "../components/_Layout"
import { Resident } from "../types"
import { GetServerSideProps } from "next"
import WorkflowPanel, { WorkflowForPanel } from "../components/WorkflowPanel"
import prisma from "../lib/prisma"
import forms from "../config/forms"
import {protectRoute} from "../lib/protectRoute";
import {pilotGroup} from "../config/allowedGroups";

interface Props {
  workflows: WorkflowForPanel[]
  resident?: Resident
}

const DiscardedPage = ({ workflows }: Props): React.ReactElement => {
  return (
    <Layout
      title="Discarded workflows"
      breadcrumbs={[
        {
          href: process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL,
          text: "Dashboard",
        },
        { href: "/", text: "Workflows" },
        { text: "Closed workflows", current: true },
      ]}
    >
      <h1 className="govuk-!-margin-bottom-8">Discarded work</h1>

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

export const getServerSideProps: GetServerSideProps = protectRoute(async ({ req }) => {
  if (!req['user']?.approver) {
    return {
      props: {},
      redirect: {
        destination: req.headers?.referer || "/",
        statusCode: 307,
      },
    }
  }

  const workflows = await prisma.workflow.findMany({
    where: {
      discardedAt: { not: null },
    },
    include: { creator: true, assignee: true, nextReview: true },
  })

  const resolvedForms = await forms()

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
}, [pilotGroup]);

export default DiscardedPage;
