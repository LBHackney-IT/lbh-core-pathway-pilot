import { NextApiRequest, NextApiResponse } from "next"
import { apiHandler } from "../../../../lib/apiHelpers"
import { triggerNextSteps } from "../../../../lib/nextSteps"
import { notifyApprover } from "../../../../lib/notify"
import { middleware as csrfMiddleware } from "../../../../lib/csrfToken"
import prisma from "../../../../lib/prisma"

export const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const { id } = req.query

  const values = JSON.parse(req.body)

  // prevent duplicate next steps if a workflow is finished again after being returned for edits
  await prisma.nextStep.deleteMany({
    where: {
      workflowId: id as string,
    },
  })

  const storedWorkflow = await prisma.workflow.findUnique({
    where: {
      id: id as string,
    }
  })

  const updatedWorkflow = await prisma.workflow.update({
    where: {
      id: id as string,
    },
    data: {
      submittedAt: new Date(),
      submittedBy: req['user']?.email,
      teamSubmittedBy: req['user']?.team,
      reviewBefore: new Date(values.reviewBefore) || null,
      workflowId: values.workflowId || storedWorkflow.workflowId || null,
      assignedTo: values.approverEmail,
      nextSteps: {
        createMany: {
          data: values.nextSteps.map(nextStep => ({
            nextStepOptionId: nextStep.nextStepOptionId,
            altSocialCareId: nextStep.altSocialCareId,
            note: nextStep.note,
          })),
        },
      },
      revisions: {
        create: {
          answers: {},
          createdBy: req['user']?.email,
          action: "Submitted",
        },
      },
    },
    include: {
      nextSteps: {
        where: {
          triggeredAt: null,
        },
      },
      creator: true,
    },
  })

  await notifyApprover(updatedWorkflow, values.approverEmail, process.env.APP_URL)
  await triggerNextSteps(updatedWorkflow)

  res.status(200).json(updatedWorkflow)
}

export default apiHandler(csrfMiddleware(handler))
