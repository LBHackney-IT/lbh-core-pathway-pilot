import { Workflow, WorkflowType } from "@prisma/client"
import { DateTime, Duration } from "luxon"
import { prettyStatuses } from "../config/statuses"
import { Status } from "../types"
import forms from "../config/forms"
import { prettyDateToNow } from "./formatters"

/** determine the current stage of a workflow for logic */
export const getStatus = (workflow: Workflow): Status => {
  // the order of these determines priority
  if (workflow.discardedAt) return Status.Discarded

  if (
    workflow.type === WorkflowType.Historic ||
    workflow.panelApprovedAt ||
    (workflow.managerApprovedAt && !workflow.needsPanelApproval)
  ) {
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
      return Status.ManagerApproved
    } else {

      return Status.NoAction
    }
  }
  if (workflow.submittedAt) return Status.Submitted
  return Status.InProgress
}

export const getStatusBasedOnApprovability = async (workflow: Workflow): Promise<Status> => {
  if (workflow.discardedAt) return Status.Discarded
  const formData = await forms()
  const thisForm = formData.find(form => form.id === workflow.formId)
  if (!thisForm.approvable) {
    return Status.NoAction
  } else {
    return getStatus(workflow)
  }
}

/** get status of a workflow for display */
export const prettyStatus = (workflow: Workflow): string => {
  const status = getStatus(workflow)

  switch (status) {
    case Status.ReviewSoon:
      return `Review due ${prettyDateToNow(String(workflow.reviewBefore))}`
      break
    default:
      return prettyStatuses[status]
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
