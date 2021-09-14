import Link from "next/link"
import useResident from "../hooks/useResident"
import { prettyDate, prettyResidentName } from "../lib/formatters"
import { completeness } from "../lib/taskList"
import { getStatus, numericStatus, prettyStatus } from "../lib/status"
import s from "./WorkflowPanel.module.scss"
import WorkflowPanelAction from "./WorkflowPanelAction"
import { Prisma } from "@prisma/client"
import { Form, Status } from "../types"

const workflowForPanel = Prisma.validator<Prisma.WorkflowArgs>()({
  include: {
    creator: true,
    assignee: true,
    submitter: true,
    nextReview: true,
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
          {workflow.assignee ? (
            workflow.submitter ? (
              `Submitted by ${
                workflow?.submitter?.name || workflow?.submittedBy
              } · `
            ) : (
              `Assigned to ${workflow?.assignee.name} · `
            )
          ) : (
            `Started by ${workflow?.creator.name} · Unassigned · `
          )}
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
          [Status.Discarded, Status.InProgress].includes(
            getStatus(workflow)
          ) && (
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
