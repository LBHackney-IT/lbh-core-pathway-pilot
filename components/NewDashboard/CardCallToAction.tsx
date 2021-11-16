import s from "./CardCallToAction.module.scss"
import { Status } from "../../types"
import { WorkflowForPlanner } from "../../pages/api/workflows"
import { completeness } from "../../lib/taskList"
import { DateTime } from "luxon"

interface Props {
  workflow: WorkflowForPlanner
  status: Status
}

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
        Waiting for{" "}
        {DateTime.fromISO(workflow.submittedAt.toString())
          .toRelative()
          .replace(" ago", "")}{" "}
      </span>
    )

  if (status === Status.ManagerApproved)
    return (
      <span className={`lbh-body-xs lmf-grey`}>
        Waiting for{" "}
        {DateTime.fromISO(workflow.managerApprovedAt.toString())
          .toRelative({})
          .replace(" ago", "")}
      </span>
    )

  if (status === Status.ReviewSoon)
    return (
      <span className={`lbh-body-xs ${s.soon}`}>
        Review in{" "}
        {DateTime.fromISO(workflow.reviewBefore.toString())
          .toRelative()
          .replace(" ago", "")}{" "}
      </span>
    )

  if (status === Status.Overdue)
    return <span className={`lbh-body-xs ${s.overdue}`}>Overdue</span>

  return null
}

export default CardCallToAction
