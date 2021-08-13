import prisma from "./prisma"
import forms from "../config/forms"
import { WorkflowWithExtras } from "../types"

export const getWorkflows = async (): Promise<WorkflowWithExtras[]> => {
  const workflows = await prisma.workflow.findMany({
    where: {
      discardedAt: null,
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
): Promise<WorkflowWithExtras> => {
  const workflow = await prisma.workflow.findUnique({
    where: { id: id },
    include: {
      creator: true,
      assignee: true,
      reviewOf: includeReviewedWorkflow,
      updater: includeRevisions,
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
