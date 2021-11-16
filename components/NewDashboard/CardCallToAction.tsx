import s from "./CardCallToAction.module.scss"
import { Status } from "../../types"
import { WorkflowForPlanner } from "../../pages/api/workflows"
import { completeness } from "../../lib/taskList"
import { DateTime } from "luxon"

interface Props {
  workflow: WorkflowForPlanner
  status: Status
}

const prettyDate = (date: Date) =>
  DateTime.fromISO(date.toString()).toRelativeCalendar({})

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

  if (status === Status.Submitted)
    return (
      <span className={`lbh-body-xs lmf-grey`}>
        Waiting for {prettyDate(workflow.submittedAt).replace(" ago", "")}
      </span>
    )

  if (status === Status.ManagerApproved)
    return (
      <span className={`lbh-body-xs lmf-grey`}>
        Waiting for {prettyDate(workflow.managerApprovedAt).replace(" ago", "")}
      </span>
    )

  if (status === Status.ReviewSoon)
    return (
      <span className={`lbh-body-xs ${s.soon}`}>
        Review {prettyDate(workflow.reviewBefore)}
      </span>
    )

  if (status === Status.Overdue)
    return (
      <span className={`lbh-body-xs ${s.overdue}`}>
        Due {prettyDate(workflow.reviewBefore)}
      </span>
    )

  return null
}

export default CardCallToAction
