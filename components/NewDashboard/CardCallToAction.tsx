import s from "./CardCallToAction.module.scss"
import { Status } from "../../types"
import { WorkflowForPlanner } from "../../pages/api/workflows"
import { completeness } from "../../lib/taskList"
import { DateTime, Duration } from "luxon"

interface Props {
  workflow: WorkflowForPlanner
  status: Status
}

const prettyDiff = (date: Date) =>
  DateTime.fromISO(date.toString()).toRelativeCalendar({})

const getDaysWaiting = (date: Date) => {
  return Math.floor(-DateTime.fromISO(date.toString()).diffNow().as("days"))
}
// DateTime.fromISO(date.toString()).diffNow().days.toString()

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
    const days = getDaysWaiting(workflow.submittedAt)
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
