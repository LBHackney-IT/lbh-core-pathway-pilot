import { Status } from "../types"

/** convert enum values to pretty strings for display */
export const prettyStatuses = {
  [Status.InProgress]: "In progress",
  [Status.Discarded]: "Discarded",
  [Status.Submitted]: "Waiting for approval",
  [Status.ManagerApproved]: "Waiting for QAM",
  [Status.NoAction]: "Completed",
  [Status.Overdue]: "Review overdue",
  [Status.ReviewSoon]: "Review soon",
}
