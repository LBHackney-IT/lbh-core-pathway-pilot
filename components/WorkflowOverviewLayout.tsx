import Link from "next/link"
import AssigneeWidget from "../components/AssigneeWidget"
import Discard from "../components/Discard"
import Layout from "../components/_Layout"
import useResident from "../hooks/useResident"
import { WorkflowWithCreatorAssigneeAndRevisions } from "../types"
import s from "../styles/RevisionHistory.module.scss"

interface Props {
  workflow: WorkflowWithCreatorAssigneeAndRevisions
  nav: React.ReactNode
  sidebar: React.ReactNode
  mainContent: React.ReactNode
}

const WorkflowOverviewLayout = ({
  workflow,
  nav,
  sidebar,
  mainContent,
}: Props): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)

  const title = resident
    ? `${resident.firstName} ${resident.lastName}`
    : "Workflow details"

  return (
    <Layout
      fullWidth
      title={title}
      breadcrumbs={[
        { href: "/", text: "Dashboard" },
        { text: "Workflow", current: true },
      ]}
    >
      <div className={`lbh-container lmf-full-width ${s.header}`}>
        <div>
          <h1 className="lbh-heading-h2 govuk-!-margin-bottom-3">{title}</h1>
          <AssigneeWidget workflowId={workflow.id} />
        </div>

        <div className={s.headerActions}>
          <Discard workflowId={workflow.id} />

          <button className="lbh-link">Put on hold</button>

          <Link href={`/workflows/${workflow.id}/steps`}>
            <a className="govuk-button lbh-button">Resume</a>
          </Link>
        </div>
      </div>

      <div className={s.splitPanes}>
        <aside className={s.sidebarPane}>
          <nav className={s.tabList}>{nav}</nav>

          {sidebar}
        </aside>

        <div className={s.mainPane}>{mainContent}</div>
      </div>
    </Layout>
  )
}

export default WorkflowOverviewLayout
