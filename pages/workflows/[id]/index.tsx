import { Workflow } from "@prisma/client"
import Link from "next/link"
import ResidentWidget from "../../../components/ResidentWidget"
import Layout from "../../../components/_Layout"
import { getWorkflowServerSide } from "../../../lib/serverSideProps"

const WorkflowPage = (workflow: Workflow): React.ReactElement => {
  return (
    <Layout
      title="Workflow details"
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

          <Link href={`/workflows/${workflow.id}/steps`}>
            <a className="govuk-button lbh-button">Resume</a>
          </Link>
        </div>

        <div className="govuk-grid-column-one-third">
          <ResidentWidget socialCareId={workflow.socialCareId} />
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps = getWorkflowServerSide

export default WorkflowPage
