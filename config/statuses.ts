import { Status } from "../types"

/** convert enum values to pretty strings for display */
export const prettyStatuses = {
  [Status.InProgress]: "In progress",
  [Status.Discarded]: "Discarded",
  [Status.Submitted]: "Submitted for approval",
  [Status.ManagerApproved]: "Approved by manager",
  [Status.NoAction]: "No action needed",
  [Status.Overdue]: "Review overdue",
  [Status.ReviewSoon]: "Review soon",
}
