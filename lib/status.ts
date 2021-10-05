import { Workflow } from "@prisma/client"
import { DateTime, Duration } from "luxon"
import { Status } from "../types"
import { prettyDateToNow } from "./formatters"

/** determine the current stage of a workflow for logic */
export const getStatus = (workflow: Workflow): Status => {
  // the order of these determines priority
  if (workflow.discardedAt) return Status.Discarded
  if (workflow.panelApprovedAt) {
    if (DateTime.fromISO(String(workflow.reviewBefore)) < DateTime.local()) {
      return Status.Overdue
    } else if (
      DateTime.fromISO(String(workflow.reviewBefore)).diffNow() <
      Duration.fromObject({
        months: 1,
      })
    ) {
      return Status.ReviewSoon
    } else {
      return Status.NoAction
    }
  }
  if (workflow.managerApprovedAt) {
    if (workflow.needsPanelApproval) {
      return Status.NoAction
    } else {
      return Status.ManagerApproved
    }
  }
  if (workflow.submittedAt) return Status.Submitted
  return Status.InProgress
}

/** get status of a workflow for display */
export const prettyStatus = (workflow: Workflow): string => {
  const status = getStatus(workflow)

  switch (status) {
    case Status.Discarded:
      return "Discarded"
      break
    case Status.ReviewSoon:
      return `Review due ${prettyDateToNow(String(workflow.reviewBefore))}`
      break
    case Status.NoAction:
      return `No action needed`
      break
    case Status.ManagerApproved:
      return `Approved by manager`
      break
    case Status.Submitted:
      return `Submitted for approval`
      break
    case Status.InProgress:
      return `In progress`
      break
    case Status.Overdue:
      return `Review overdue`
      break
    default:
      return status
      break
  }
}

/** determine the current status of a workflow, numerically */
export const numericStatus = (workflow: Workflow): number => {
  const status = getStatus(workflow)
  if (status === Status.NoAction) return 3
  if (status === Status.ManagerApproved) return 2
  return 1
}
