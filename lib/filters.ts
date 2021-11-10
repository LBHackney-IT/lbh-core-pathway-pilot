import { Prisma } from "@prisma/client"
import { Status } from "../types"
import { DateTime } from "luxon"

/** build prisma where queries to search by each status */
export const filterByStatus = (status: Status): Prisma.WorkflowWhereInput => {
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
        },
      }
      break
    }
    case Status.Discarded: {
      return { discardedAt: { not: null } }
      break
    }
    case Status.NoAction: {
      // TODO: handle needsPanelApproval
      return {
        OR: [
          {
            panelApprovedAt: { not: null },
            reviewBefore: {
              gte: monthFromNow,
            },
          },
          {
            panelApprovedAt: { not: null },
            reviewBefore: null,
          },
        ],
      }
      break
    }
    case Status.ManagerApproved: {
      // TODO: handle needsPanelApproval
      return {
        panelApprovedAt: null,
        managerApprovedAt: { not: null },
        needsPanelApproval: true,
      }
      break
    }
    case Status.Submitted: {
      return { submittedAt: { not: null }, managerApprovedAt: null }
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
