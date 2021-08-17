import prisma from "./prisma"
import { Prisma, WorkflowType } from "@prisma/client"
import forms from "../config/forms"
import { Status, WorkflowWithExtras } from "../types"
import { DateTime } from "luxon"

const filterByStatus = (status: Status): Prisma.WorkflowWhereInput => {
  switch (status) {
    case Status.ReviewSoon: {
      return {
        reviewBefore: {
          gte: DateTime.fromObject({
            month: 1,
          }).toJSDate(),
        },
      }
      break
    }
    case Status.Discarded: {
      return { discardedAt: { not: null } }
      break
    }
    case Status.NoAction: {
      return { panelApprovedAt: { not: null } }
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
  formId: string
  onlyReviewsReassessments?: boolean
  discardedOnly?: boolean
}

/** get a list of workflows, optionally for a particular resident */
export const getWorkflows = async (
  opts: Opts
): Promise<WorkflowWithExtras[]> => {
  const {
    socialCareId,
    status,
    formId,
    discardedOnly,
    onlyReviewsReassessments,
  } = opts

  const workflows = await prisma.workflow.findMany({
    where: {
      formId,
      discardedAt: discardedOnly ? { not: null } : null,
      socialCareId,
      ...filterByStatus(status),
      type: onlyReviewsReassessments
        ? {
            in: [WorkflowType.Reassessment, WorkflowType.Review],
          }
        : undefined,
    },
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
    form: forms.find(form => form.id === workflow.formId),
  }
}
