import { Workflow } from "@prisma/client"
import { GetServerSideProps } from "next"
import Link from "next/link"
import Layout from "../../../components/_Layout"
import { prettyDate } from "../../../lib/formatters"
import prisma from "../../../lib/prisma"

const WorkflowPage = (workflow: Workflow): React.ReactElement => {
  return (
    <Layout
      title="Are the personal details correct?"
      breadcrumbs={[
        { href: "/", text: "Dashboard" },
        { text: "Workflow", current: true },
      ]}
    >
      <h1>Workflow details</h1>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <dl className="govuk-summary-list lbh-summary-list">
            {Object.entries(workflow)
              .filter(row => row[1])
              .map(([key, value]) => (
                <div className="govuk-summary-list__row" key={key}>
                  <dt className="govuk-summary-list__key">{key}</dt>
                  <dd className="govuk-summary-list__value">
                    {JSON.stringify(value)}
                  </dd>
                </div>
              ))}
          </dl>

          {/* {prettyDate(workflow.createdAt.toString())} */}

          <Link href={`/workflows/${workflow.id}/steps`}>
            <a className="govuk-button lbh-button">Resume</a>
          </Link>
        </div>
      </div>
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
