import AssignmentWidget from "./AssignmentWidget"
import Discard from "../components/Discard"
import Layout from "../components/_Layout"
import useResident from "../hooks/useResident"
import s from "../styles/LeftSidebar.module.scss"
import { prettyResidentName } from "../lib/formatters"
import PrimaryAction, { WorkflowForPrimaryAction } from "./PrimaryAction"
import { Form, Status } from "../types"
import { getStatus } from "../lib/status"
import Link from "next/link"
import Acknowledgement from "./Acknowledgement"
import Hold from "./Hold"
import { useContext } from "react"
import { SessionContext } from "../lib/auth/SessionContext"

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
  const session = useContext(SessionContext)
  const status = getStatus(workflow)

  return (
    <Layout
      fullWidth
      title={workflow?.form?.name || "Workflow"}
      breadcrumbs={[
        {
          href: `${process.env.NEXT_PUBLIC_SOCIAL_CARE_APP_URL}/residents/${workflow.socialCareId}`,
          text: resident ? prettyResidentName(resident) : workflow.socialCareId,
        },
        { text: "Workflow", current: true },
      ]}
    >
      <div className={`lbh-container lmf-full-width ${s.header}`}>
        <div>
          <h1 className={`lbh-heading-h2 govuk-!-margin-bottom-3 ${s.heading}`}>
            {workflow?.form?.name || "Workflow"}
            {resident && ` for ${prettyResidentName(resident)}`}
            {workflow.type === "Reassessment" && (
              <span className="govuk-tag lbh-tag lbh-tag--blue">
                Reassessment
              </span>
            )}
            {workflow.type === "Review" && (
              <span className="govuk-tag lbh-tag lbh-tag--blue">Review</span>
            )}
            {workflow.type === "Historic" && (
              <span className="govuk-tag lbh-tag lbh-tag--grey">Historic</span>
            )}
            {workflow.heldAt && (
              <span className="govuk-tag lbh-tag lbh-tag--yellow">Urgent</span>
            )}
          </h1>

          <AssignmentWidget workflowId={workflow.id} status={status} />
        </div>

        <div className={s.headerActions}>
          {[Status.NoAction, Status.ReviewSoon, Status.Overdue].includes(
            status
          ) &&
            !workflow.acknowledgedAt && (
              <Acknowledgement workflowId={workflow.id} />
            )}

          {status !== Status.NoAction && (
            <Hold workflowId={workflow.id} held={!!workflow.heldAt} />
          )}

          {status === Status.InProgress ? (
            <>
              {!workflow.discardedAt && session?.approver && (
                <Discard workflowId={workflow.id} />
              )}
            </>
          ) : (
            <Link href={`/workflows/${workflow.id}/printable`}>
              <a
                className="lbh-link lbh-link--no-visited-state"
                target="_blank"
              >
                Shareable version
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
          <div className={s.mainContentProportionalMargins}>{mainContent}</div>
          {footer && <div className={s.footer}>{footer}</div>}
        </div>
      </div>
    </Layout>
  )
}

export default WorkflowOverviewLayout
