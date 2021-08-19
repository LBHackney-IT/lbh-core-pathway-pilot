import prisma from "./prisma"
import { Prisma, WorkflowType } from "@prisma/client"
import forms from "../config/forms"
import { Sort, Status, WorkflowWithExtras } from "../types"
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
  sort?: Sort
}

/** get a list of workflows, optionally for a particular resident */
export const getWorkflows = async (
  opts: Opts
): Promise<WorkflowWithExtras[]> => {
  const where: Prisma.WorkflowWhereInput = {
    formId: opts?.formId,
    discardedAt: opts?.status === Status.Discarded ? { not: null } : null,
    socialCareId: opts?.socialCareId,
    type: opts?.onlyReviewsReassessments
      ? {
          in: [WorkflowType.Reassessment, WorkflowType.Review],
        }
      : undefined,
    ...filterByStatus(opts?.status),
    // hide things that have already been reviewed
    nextReview: {
      is: null,
    },
  }

  let orderBy: Prisma.WorkflowOrderByInput
  if (opts.sort === "recently-started") orderBy = { createdAt: "desc" }
  if (opts.sort === "recently-updated") orderBy = { updatedAt: "desc" }

  const workflows = await prisma.workflow.findMany({
    where,
    include: {
      creator: true,
      assignee: true,
      nextReview: true,
    },
    orderBy,
  })

  return workflows.map(workflow => ({
    ...workflow,
    form: forms.find(form => form.id === workflow.formId),
  }))
}

export const getWorkflow = async (
  id: string,
  include?: Prisma.WorkflowInclude
): Promise<WorkflowWithExtras> => {
  const workflow = await prisma.workflow.findUnique({
    where: { id: id },
    include,
  })

  if (workflow)
    return {
      ...workflow,
      form: forms.find(form => form.id === workflow?.formId),
    }

  return null
}
