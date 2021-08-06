import { Workflow } from "@prisma/client"
import prisma from "./prisma"

export const getWorkflows = async (): Promise<Workflow[]> =>
  await prisma.workflow.findMany({
    where: {
      discardedAt: null,
    },
    include: {
      creator: true,
      assignee: true,
    },
    orderBy: {
      heldAt: "desc",
    },
  })

export const getWorkflow = async (
  id: string,
  includeRevisions?: boolean,
  includeReviewedWorkflow?: boolean
): Promise<Workflow> =>
  await prisma.workflow.findUnique({
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
