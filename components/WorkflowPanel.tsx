import Link from "next/link"
import useResident from "../hooks/useResident"
import { prettyDate } from "../lib/formatters"
import { completeness } from "../lib/taskList"
import { numericStage, stage } from "../lib/stage"
import { WorkflowWithCreatorAndAssignee } from "../types"
import s from "./WorkflowPanel.module.scss"

interface Props {
  workflow: WorkflowWithCreatorAndAssignee
}

const WorkflowPanel = ({ workflow }: Props): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)

  return (
    <div className={workflow.heldAt ? `${s.outer} ${s.held}` : s.outer}>
      <div className={s.person}>
        <h3>
          {resident ? (
            `${resident?.firstName} ${resident?.lastName}`
          ) : (
            <span className={s.placeholder}>{workflow.socialCareId}</span>
          )}
          {workflow.workflowId && (
            <span className={`govuk-tag lbh-tag lbh-tag--green ${s.review}`}>
              Review
            </span>
          )}
        </h3>
        <p className={s.meta}>
          {workflow.heldAt &&
            `Held since ${prettyDate(String(workflow.heldAt))} · `}
          {workflow.assignee ? (
            <>Assigned to {workflow?.assignee.name}</>
          ) : (
            <>Started by {workflow?.creator.name} · Unassigned</>
          )}{" "}
          ·{" "}
          <Link href={`/workflows/${workflow.id}`}>
            <a className="lbh-link lbh-link--muted">Details</a>
          </Link>
        </p>
      </div>

      <dl className={s.stats}>
        <div>
          <dd>{Math.floor(completeness(workflow) * 100)}%</dd>
          <dt>complete</dt>
        </div>
        <div>
          <dd>{stage(workflow)}</dd>
          <dt>current stage</dt>
        </div>
      </dl>

      <Link href={`/workflows/${workflow.id}/steps`}>
        <a className="govuk-button lbh-button">Resume</a>
      </Link>

      <div
        className={s.meter}
        aria-hidden="true"
        data-stage={numericStage(workflow)}
      >
        <div></div>
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
