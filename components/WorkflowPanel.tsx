import Link from "next/link"
import useResident from "../hooks/useResident"
import { WorkflowWithCreator, WorkflowWithCreatorAndAssignee } from "../types"
import s from "./WorkflowPanel.module.scss"

interface Props {
  workflow: WorkflowWithCreatorAndAssignee
}

const WorkflowPanel = ({ workflow }: Props): React.ReactElement => {
  const { data: resident } = useResident(workflow.socialCareId)

  return (
    <div className={s.outer}>
      <div className={s.person}>
        <h3>
          {resident ? (
            `${resident?.firstName} ${resident?.lastName}`
          ) : (
            <span className={s.placeholder}>{workflow.socialCareId}</span>
          )}
        </h3>
        <p className={s.meta}>
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
          <dd>XX%</dd>
          <dt>complete</dt>
        </div>
        <div>
          <dd>XX</dd>
          <dt>current step</dt>
        </div>
      </dl>

      <Link href={`/workflows/${workflow.id}/steps`}>
        <a className="govuk-button lbh-button">Resume</a>
      </Link>

      <div className={s.meter} aria-hidden="true" data-completion={2}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}

export default WorkflowPanel
