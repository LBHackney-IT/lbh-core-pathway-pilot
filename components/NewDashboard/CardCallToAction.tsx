import s from "./CardCallToAction.module.scss"
import { Status } from "../../types"
import { WorkflowForPlanner } from "../../pages/api/workflows"
import { completeness } from "../../lib/taskList"
import { DateTime } from "luxon"

interface Props {
  workflow: WorkflowForPlanner
  status: Status
}

const isDate = (thing: unknown): thing is Date =>
  thing?.constructor?.name === 'Date';

const prettyDiff = (date: string | Date) =>
  DateTime.fromISO(isDate(date) ? date.toISOString() : date).toRelativeCalendar({});

const getDaysWaiting = (date: string | Date) =>
  Math.floor(-DateTime.fromISO(isDate(date) ? date.toISOString() : date).diffNow().as("days"));

const CardCallToAction = ({
  workflow,
  status,
}: Props): React.ReactElement | null => {
  if (status === Status.InProgress)
    return (
      <span className={`lbh-body-xs ${s.completion}`}>
        {Math.floor(completeness(workflow) * 100)}% complete
      </span>
    )

  if (status === Status.Submitted) {
    const days = getDaysWaiting(workflow.submittedAt);
    if (days > 0)
      return (
        <span className={`lbh-body-xs  ${s.soon}`}>
          Waiting {days} day{days !== 1 ? "s" : ""}
        </span>
      )
  }

  if (status === Status.ManagerApproved) {
    const days = getDaysWaiting(workflow.managerApprovedAt)
    if (days > 0)
      return (
        <span className={`lbh-body-xs  ${s.soon}`}>
          Waiting {days} day{days !== 1 ? "s" : ""}
        </span>
      )
  }

  if (status === Status.ReviewSoon)
    return (
      <span className={`lbh-body-xs ${s.soon}`}>
        Review {prettyDiff(workflow.reviewBefore)}
      </span>
    )

  if (status === Status.Overdue)
    return (
      <span className={`lbh-body-xs ${s.overdue}`}>
        Due {prettyDiff(workflow.reviewBefore)}
      </span>
    )

  return null
}

export default CardCallToAction
