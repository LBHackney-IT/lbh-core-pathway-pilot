import prisma from "./prisma"
import forms from "../config/forms"
import { WorkflowWithExtras } from "../types"

/** get a list of workflows, optionally for a particular resident */
export const getWorkflows = async (
  socialCareId?: string
): Promise<WorkflowWithExtras[]> => {
  const workflows = await prisma.workflow.findMany({
    where: {
      discardedAt: null,
      socialCareId: socialCareId,
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
  includeReviewedWorkflow?: boolean
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
