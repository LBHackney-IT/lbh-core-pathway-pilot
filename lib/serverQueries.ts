import prisma from "./prisma"
import { Prisma, WorkflowType } from "@prisma/client"
import forms from "../config/forms"
import { Status, WorkflowWithExtras } from "../types"
import { DateTime } from "luxon"

/** build prisma where queries to search by each status */
const filterByStatus = (status: Status): Prisma.WorkflowWhereInput => {
  const monthFromNow = DateTime.local().plus({ month: 1 }).toJSDate()

  switch (status) {
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
      return { panelApprovedAt: null, managerApprovedAt: { not: null } }
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

interface Opts {
  socialCareId?: string
  status?: Status
  formId?: string
  onlyReviewsReassessments?: boolean
}

/** get a list of workflows, optionally for a particular resident */
export const getWorkflows = async (
  opts: Opts
): Promise<WorkflowWithExtras[]> => {
  const where = {
    formId: opts?.formId,
    discardedAt: opts?.status === Status.Discarded ? { not: null } : null,
    socialCareId: opts?.socialCareId,
    type: opts?.onlyReviewsReassessments
      ? {
          in: [WorkflowType.Reassessment, WorkflowType.Review],
        }
      : undefined,
    ...filterByStatus(opts?.status),
  }

  console.log(where)

  const workflows = await prisma.workflow.findMany({
    where: where,
    include: {
      creator: true,
      assignee: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return workflows.map(workflow => ({
    ...workflow,
    form: forms.find(form => form.id === workflow.formId),
  }))
}

export const getWorkflow = async (
  id: string,
  includeRevisions?: boolean,
  includeReviewedWorkflow?: boolean,
  includeApprovals?: boolean
): Promise<WorkflowWithExtras> => {
  const workflow = await prisma.workflow.findUnique({
    where: { id: id },
    include: {
      creator: true,
      assignee: true,
      reviewOf: includeReviewedWorkflow,
      updater: includeRevisions,
      managerApprover: includeApprovals,
      panelApprover: includeApprovals,
      revisions: includeRevisions
        ? {
            include: {
              actor: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          }
        : false,
    },
  })

  return {
    ...workflow,
    form: forms.find(form => form.id === workflow?.formId),
  }
}
