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

  if (status === Status.Submitted && getDaysWaiting(workflow.submittedAt))
    return (
      <span className={`lbh-body-xs  ${s.soon}`}>
        Waiting {getDaysWaiting(workflow.submittedAt)} days
      </span>
    )

  if (
    status === Status.ManagerApproved &&
    getDaysWaiting(workflow.managerApprovedAt)
  )
    return (
      <span className={`lbh-body-xs  ${s.soon}`}>
        Waiting {getDaysWaiting(workflow.managerApprovedAt)} days
      </span>
    )

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
