import AssignmentWidget from "./AssignmentWidget"
import Discard from "../components/Discard"
import Layout from "../components/_Layout"
import useResident from "../hooks/useResident"
import s from "../styles/RevisionHistory.module.scss"
import Hold from "./Hold"
import { prettyResidentName } from "../lib/formatters"
import PrimaryAction, { WorkflowForPrimaryAction } from "./PrimaryAction"
import { Form, Status } from "../types"
import { getStatus } from "../lib/status"
import Link from "next/link"
import { useSession } from "next-auth/client"

interface Props {
  workflow: WorkflowForPrimaryAction & { form?: Form }
  nav: React.ReactNode
  sidebar: React.ReactNode
  mainContent: React.ReactNode
  footer?: React.ReactNode
}

const WorkflowOverviewLayout = ({
  workflow,
  nav,
  sidebar,
  footer,
  mainContent,
}: Props): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)
  const [session] = useSession()

  return (
    <Layout
      fullWidth
      title={workflow?.form?.name || "Workflow"}
      breadcrumbs={[
        {
          href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/people/${resident?.mosaicId}`,
          text: prettyResidentName(resident),
        },
        { text: "Workflow", current: true },
      ]}
    >
      <div className={`lbh-container lmf-full-width ${s.header}`}>
        <div>
          <h1 className={`lbh-heading-h2 govuk-!-margin-bottom-3 ${s.heading}`}>
            {workflow?.form?.name || "Workflow"} for{" "}
            {prettyResidentName(resident)}
            {(workflow.type === "Reassessment" ||
              workflow.type === "Review") && (
              <span className="govuk-tag lbh-tag lbh-tag--blue">
                Reassessment
              </span>
            )}
            {workflow.heldAt && (
              <span className="govuk-tag lbh-tag lbh-tag--yellow">On hold</span>
            )}
          </h1>

          <AssignmentWidget workflowId={workflow.id} />
        </div>

        <div className={s.headerActions}>
          {getStatus(workflow) === Status.InProgress ? (
            <>
              {!workflow.discardedAt && session?.user?.approver && (
                <Discard workflowId={workflow.id} />
              )}
              <Hold workflowId={workflow.id} held={!!workflow.heldAt} />
            </>
          ) : (
            <Link href={`/workflows/${workflow.id}/printable`}>
              <a className="lbh-link lbh-link--no-visited-state">
                Printable version
              </a>
            </Link>
          )}

          <PrimaryAction workflow={workflow} />
        </div>
      </div>

      <div className={s.splitPanes}>
        <aside className={s.sidebarPane}>
          <nav className={s.tabList}>{nav}</nav>

          {sidebar}
        </aside>

        <div className={s.mainPane}>
          <div className={s.mainContent}>{mainContent}</div>
          {footer && <div className={s.footer}>{footer}</div>}
        </div>
      </div>
    </Layout>
  )
}

export default WorkflowOverviewLayout
