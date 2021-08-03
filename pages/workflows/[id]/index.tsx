import Link from "next/link"
import AssigneeWidget from "../../../components/AssigneeWidget"
import Discard from "../../../components/Discard"
import Layout from "../../../components/_Layout"
import useResident from "../../../hooks/useResident"
import { getWorkflowWithRevisionsServerSide } from "../../../lib/serverSideProps"
import { WorkflowWithCreatorAssigneeAndRevisions } from "../../../types"
import s from "../../../styles/RevisionHistory.module.scss"

const WorkflowPage = (
  workflow: WorkflowWithCreatorAssigneeAndRevisions
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
      <div className={`lbh-container lmf-full-width ${s.header}`}>
        <div>
          <h1 className="lbh-heading-h2 govuk-!-margin-bottom-3">
            {resident
              ? `${resident.firstName} ${resident.lastName}`
              : "Workflow details"}
          </h1>
          <AssigneeWidget workflowId={workflow.id} />
        </div>

        <div className={s.headerActions}>
          <Discard workflowId={workflow.id} />

          <Link href={`/workflows/${workflow.id}/steps`}>
            <a className="govuk-button lbh-button">Resume</a>
          </Link>
        </div>
      </div>

      <div className={s.splitPanes}>
        <aside className={s.sidebarPane}>
          {JSON.stringify(workflow.revisions, null, 1)}
        </aside>

        <div className={s.mainPane}>{JSON.stringify(workflow.answers)}</div>
      </div>
    </Layout>
  )
}

export const getServerSideProps = getWorkflowWithRevisionsServerSide

export default WorkflowPage
