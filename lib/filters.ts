import { Prisma, WorkflowType } from "@prisma/client"
import { Status } from "../types"
import { DateTime } from "luxon"

/** build prisma where queries to search by each status */
export const filterByStatus = (status: Status, nonApprovableFormIds?: string[] ): Prisma.WorkflowWhereInput => {
  const monthFromNow = DateTime.local().plus({ months: 1 }).toJSDate()

  switch (status) {
    case Status.Overdue: {
      return {
        reviewBefore: {
          lte: DateTime.local().toJSDate(),
        },
      }
      break
    }
    case Status.ReviewSoon: {
      return {
        reviewBefore: {
          lte: monthFromNow,
          gte: DateTime.local().toJSDate(),
        },
      }
      break
    }
    case Status.Discarded: {
      return { discardedAt: { not: null } }
      break
    }
    case Status.NoAction: {
      return {
        OR: [
          {
            // 1. panel approved, and review date is more than a month from now
            panelApprovedAt: { not: null },
            reviewBefore: {
              gte: monthFromNow,
            },
          },
          {
            // 2. panel approved, and review date isn't known
            panelApprovedAt: { not: null },
            reviewBefore: null,
          },
          {
            // 3. manager approved, panel approval isn't needed, and review date is more than a month from now
            needsPanelApproval: false,
            managerApprovedAt: { not: null },
            reviewBefore: {
              gte: monthFromNow,
            },
          },
          {
            // 4. manager approved, panel approval isn't needed, and review date isn't known
            needsPanelApproval: false,
            managerApprovedAt: { not: null },
            reviewBefore: null,
          },
          {
            // 5.  historic work, and review date is more than a month from now
            type: "Historic",
            reviewBefore: {
              gte: monthFromNow,
            },
          },
          {
            // 6. historic work, and review date isn't known
            type: "Historic",
            reviewBefore: null,
          },
          {
            //7. form id is a not approvable form and it's submited
            formId: {in: nonApprovableFormIds || []},
            submittedAt: { not: null }
          }
        ],
      }
      break
    }
    case Status.ManagerApproved: {
      return {
        type: { not: WorkflowType.Historic },
        panelApprovedAt: null,
        managerApprovedAt: { not: null },
        needsPanelApproval: true,
      }
      break
    }
    case Status.Submitted: {
      return { submittedAt: { not: null }, managerApprovedAt: null, formId: {not: {in: nonApprovableFormIds || []}}}
      break
    }
    case Status.InProgress: {
      return { submittedAt: null, discardedAt: null }
      break
    }
    default: {
      return {}
      break
    }
  }
}
