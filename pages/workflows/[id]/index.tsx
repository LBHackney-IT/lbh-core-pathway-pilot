import Link from "next/link"
import AssigneeWidget from "../../../components/AssigneeWidget"
import Discard from "../../../components/Discard"
import ResidentWidget from "../../../components/ResidentWidget"
import Layout from "../../../components/_Layout"
import useResident from "../../../hooks/useResident"
import { getWorkflowServerSide } from "../../../lib/serverSideProps"
import { WorkflowWithCreatorAndAssignee } from "../../../types"

const WorkflowPage = (
  workflow: WorkflowWithCreatorAndAssignee
): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)

  return (
    <Layout
      fullWidth
      title="Workflow details"
      breadcrumbs={[
        { href: "/", text: "Dashboard" },
        { text: "Workflow", current: true },
      ]}
    >
      <h1>
        {resident
          ? `${resident.firstName} ${resident.lastName}`
          : "Workflow details"}
      </h1>

      <AssigneeWidget workflowId={workflow.id} />

      <Discard workflowId={workflow.id} />

      <Link href={`/workflows/${workflow.id}/steps`}>
        <a className="govuk-button lbh-button">Resume</a>
      </Link>

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
    </Layout>
  )
}

export const getServerSideProps = getWorkflowServerSide

export default WorkflowPage
