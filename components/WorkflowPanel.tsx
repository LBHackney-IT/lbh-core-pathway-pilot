import Link from "next/link"
import useResident from "../hooks/useResident"
import { prettyDate, prettyResidentName } from "../lib/formatters"
import { completeness } from "../lib/taskList"
import { getStatus, numericStatus, prettyStatus } from "../lib/status"
import s from "./WorkflowPanel.module.scss"
import { Prisma, WorkflowType } from "@prisma/client"
import { Form, Status } from "../types"
import { prettyTeamNames } from "../config/teams"
import { useContext } from "react"
import { SessionContext } from "../lib/auth/SessionContext"

const workflowForPanel = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    creator: true,
    assignee: true,
    submitter: true,
    nextWorkflows: true,
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
  const session = useContext(SessionContext)

  const reassessment = workflow.nextWorkflows.find(
    w => w.type === WorkflowType.Reassessment
  )

  return (
    <div className={workflow.heldAt ? `${s.outer} ${s.held}` : s.outer}>
      <div className={s.person}>
        <h3>
          {resident ? (
            prettyResidentName(resident)
          ) : (
            <span className={s.placeholder}>{workflow.socialCareId}</span>
          )}
          {(workflow.type === "Reassessment" || workflow.type === "Review") && (
            <span className={`govuk-tag lbh-tag lbh-tag--blue  ${s.review}`}>
              Reassessment
            </span>
          )}
          {workflow.type === "Historic" && (
            <span className={`govuk-tag lbh-tag lbh-tag--grey  ${s.review}`}>
              Historic
            </span>
          )}
        </h3>

        <p className={s.meta}>
          {workflow.heldAt && `Urgent · `}
          {workflow.form && `${workflow.form.name} · `}

          {workflow.panelApprovedAt
            ? workflow.panelApprovedBy !== session?.email
              ? `Authorised by ${
                  workflow?.panelApprover?.name || workflow?.panelApprovedBy
                } on ${prettyDate(String(workflow.panelApprovedAt))} · `
              : `Authorised by me on ${prettyDate(
                  String(workflow.panelApprovedAt)
                )} · `
            : ""}

          {workflow.managerApprovedAt && !workflow.needsPanelApproval
            ? workflow.managerApprovedBy !== session?.email
              ? `Approved by ${
                  workflow?.managerApprover?.name || workflow?.managerApprovedBy
                } on ${prettyDate(String(workflow.managerApprovedAt))} · `
              : `Approved by me on ${prettyDate(
                  String(workflow.managerApprovedAt)
                )} · `
            : ""}

          {status === Status.Submitted
            ? workflow.submittedBy !== session?.email
              ? `Submitted by ${
                  workflow?.submitter?.name || workflow?.submittedBy
                } on ${prettyDate(String(workflow.submittedAt))} · `
              : `Submitted by me on ${prettyDate(
                  String(workflow.submittedAt)
                )} · `
            : ""}

          {status === Status.InProgress
            ? workflow.createdBy !== session?.email
              ? `Started by ${
                  workflow?.creator?.name || workflow?.createdBy
                } on ${prettyDate(String(workflow.createdAt))} · `
              : `Started by me on ${prettyDate(String(workflow.createdAt))} · `
            : ""}

          {(status === Status.InProgress &&
            workflow.assignedTo !== workflow.createdBy) ||
          (![Status.NoAction, Status.InProgress].includes(status) &&
            workflow.assignedTo !== session?.email)
            ? workflow.assignee
              ? `Assigned to ${workflow?.assignee.name} · `
              : workflow.teamAssignedTo
              ? `Assigned to ${
                  prettyTeamNames[workflow.teamAssignedTo]
                } team · `
              : "Unassigned · "
            : ""}

          {status === Status.NoAction &&
            workflow.reviewBefore &&
            !reassessment &&
            `Reassess before ${prettyDate(String(workflow.reviewBefore))} · `}

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

      <Link href={`/workflows/${workflow.id}`}>
        <a className="govuk-button lbh-button">View</a>
      </Link>

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
