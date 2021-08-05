import { Workflow } from "@prisma/client"

/** determine the current stage of a workflow */
export const stage = (workflow: Workflow): string => {
  // the order of these determines priority
  if (workflow.discardedAt) return "Discarded"
  if (workflow.type === "Screening") return "Screening"
  if (workflow.panelApprovedAt) return "Approved by panel"
  if (workflow.managerApprovedAt) return "Approved by manager"
  if (workflow.submittedAt) return "Submitted for approval"
  return "In progress"
}

/** determine the current stage of a workflow */
export const numericStage = (workflow: Workflow): number => {
  if (workflow.panelApprovedAt) return 4
  if (workflow.managerApprovedAt) return 3
  if (workflow.type === "Screening") return 1
  return 2
}
