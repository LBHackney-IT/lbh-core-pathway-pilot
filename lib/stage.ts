import { Workflow } from "@prisma/client"
import { DateTime, Duration } from "luxon"
import { prettyDateToNow } from "./formatters"

/** determine the current stage of a workflow */
export const stage = (workflow: Workflow): string => {
  // the order of these determines priority
  if (workflow.discardedAt) return "Discarded"
  if (workflow.panelApprovedAt) {
    if (
      DateTime.fromISO(String(workflow.reviewBefore)).diffNow() <
      Duration.fromObject({
        month: 1,
      })
    ) {
      return `Review due ${prettyDateToNow(String(workflow.reviewBefore))}`
    } else {
      return "No action needed"
    }
  }
  if (workflow.managerApprovedAt) return "Approved by manager"
  if (workflow.submittedAt) return "Submitted for approval"
  return "In progress"
}

/** determine the current stage of a workflow */
export const numericStage = (workflow: Workflow): number => {
  if (workflow.panelApprovedAt) return 3
  if (workflow.managerApprovedAt) return 2
  return 1
}
