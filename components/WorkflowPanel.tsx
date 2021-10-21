import Link from "next/link"
import useResident from "../hooks/useResident"
import { prettyDate, prettyResidentName } from "../lib/formatters"
import { completeness } from "../lib/taskList"
import { getStatus, numericStatus, prettyStatus } from "../lib/status"
import s from "./WorkflowPanel.module.scss"
import WorkflowPanelAction from "./WorkflowPanelAction"
import { Prisma } from "@prisma/client"
import { Form, Status } from "../types"
import { prettyTeamNames } from "../config/teams"
import { useSession } from "../node_modules/next-auth/client"

const workflowForPanel = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    creator: true,
    assignee: true,
    submitter: true,
    nextReview: true,
    comments: true,
    managerApprover: true,
    panelApprover: true,
  },
})
export type WorkflowForPanel = Prisma.WorkflowGetPayload<
  typeof workflowForPanel
> & { form?: Form }

interface Props {
  workflow: WorkflowForPanel
}

const WorkflowPanel = ({ workflow }: Props): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)
  const status = getStatus(workflow)
  const [session] = useSession()

  return (
    <div className={workflow.heldAt ? `${s.outer} ${s.held}` : s.outer}>
      <div className={s.person}>
        <h3>
          {resident ? (
            prettyResidentName(resident)
          ) : (
            <span className={s.placeholder}>{workflow.socialCareId}</span>
          )}
          {workflow.type === "Reassessment" && (
            <span className={`govuk-tag lbh-tag lbh-tag--blue  ${s.review}`}>
              Reassessment
            </span>
          )}
          {workflow.type === "Review" && (
            <span className={`govuk-tag lbh-tag lbh-tag--blue  ${s.review}`}>
              Review
            </span>
          )}
        </h3>

        <p className={s.meta}>
          {workflow.heldAt &&
            `Held since ${prettyDate(String(workflow.heldAt))} · `}
          {workflow.form && `${workflow.form.name} · `}

          {workflow.panelApprovedAt
            ? workflow.panelApprovedBy !== session?.user?.email
              ? `Authorised by ${
                  workflow?.panelApprover?.name || workflow?.panelApprovedBy
                } on ${prettyDate(String(workflow.panelApprovedAt))} · `
              : `Authorised by me on ${prettyDate(
                  String(workflow.panelApprovedAt)
                )} · `
            : ""}

          {workflow.managerApprovedAt && !workflow.needsPanelApproval
            ? workflow.managerApprovedBy !== session?.user?.email
              ? `Approved by ${
                  workflow?.managerApprover?.name || workflow?.managerApprovedBy
                } on ${prettyDate(String(workflow.managerApprovedAt))} · `
              : `Approved by me on ${prettyDate(
                  String(workflow.managerApprovedAt)
                )} · `
            : ""}

          {status === Status.Submitted
            ? workflow.submittedBy !== session?.user?.email
              ? `Submitted by ${
                  workflow?.submitter?.name || workflow?.submittedBy
                } on ${prettyDate(String(workflow.submittedAt))} · `
              : `Submitted by me on ${prettyDate(
                  String(workflow.submittedAt)
                )} · `
            : ""}

          {status === Status.InProgress
            ? workflow.createdBy !== session?.user?.email
              ? `Started by ${
                  workflow?.creator?.name || workflow?.createdBy
                } on ${prettyDate(String(workflow.createdAt))} · `
              : `Started by me on ${prettyDate(String(workflow.createdAt))} · `
            : ""}

          {(status === Status.InProgress &&
            workflow.assignedTo !== workflow.createdBy) ||
          (![Status.NoAction, Status.InProgress].includes(status) &&
            workflow.assignedTo !== session?.user?.email)
            ? workflow.assignee
              ? `Assigned to ${workflow?.assignee.name} · `
              : workflow.teamAssignedTo
              ? `Assigned to ${
                  prettyTeamNames[workflow.teamAssignedTo]
                } team · `
              : "Unassigned · "
            : ""}

          {workflow.comments?.length > 0 &&
            `${workflow.comments.length} ${
              workflow.comments.length === 1 ? "comment" : "comments"
            } · `}

          <Link href={`/workflows/${workflow.id}`}>
            <a className="lbh-link lbh-link--muted">Overview</a>
          </Link>
        </p>
      </div>

      <dl className={s.stats}>
        <div>
          <dd>{prettyStatus(workflow)}</dd>
          <dt>current status</dt>
        </div>

        {workflow.form &&
          [Status.Discarded, Status.InProgress].includes(status) && (
            <div>
              <dd>{Math.floor(completeness(workflow) * 100)}%</dd>
              <dt>complete</dt>
            </div>
          )}
      </dl>

      <WorkflowPanelAction workflow={workflow} />

      <div
        className={s.meter}
        aria-hidden="true"
        data-stage={numericStatus(workflow)}
      >
        <div>
          <div
            style={{ width: `${Math.floor(completeness(workflow) * 100)}%` }}
          ></div>
        </div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}

export default WorkflowPanel
