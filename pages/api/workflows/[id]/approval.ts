import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../../lib/apiHelpers"
import { triggerNextSteps } from "../../../../lib/nextSteps"
import { notifyReturnedForEdits } from "../../../../lib/notify"
import prisma from "../../../../lib/prisma"

export const handler = async (
  req: ApiRequestWithSession,
  res: NextApiResponse
): Promise<void> => {
  const { id } = req.query

  if (!req.session.user.approver)
    return res
      .status(400)
      .json({ error: "You're not authorised to perform that action" })

  switch (req.method) {
    case "POST": {
      const workflow = await prisma.workflow.findUnique({
        where: {
          id: id as string,
        },
      })

      let updatedWorkflow

      if (workflow.managerApprovedAt) {
        // panel approvals
        if (!req.session.user.panelApprover)
          return res
            .status(400)
            .json({ error: "You're not authorised to perform that action" })

        updatedWorkflow = await prisma.workflow.update({
          where: {
            id: id as string,
          },
          data: {
            panelApprovedAt: new Date(),
            panelApprovedBy: req.session.user.email,
          },
        })
      } else {
        // manager approvals
        updatedWorkflow = await prisma.workflow.update({
          where: {
            id: id as string,
          },
          data: {
            managerApprovedAt: new Date(),
            managerApprovedBy: req.session.user.email,
          },
          include: {
            nextSteps: true,
            creator: true,
          },
        })
        // await triggerNextSteps(updatedWorkflow)
      }

      res.json(updatedWorkflow)
      break
    }
    case "DELETE": {
      const { reason } = JSON.parse(req.body)
      const workflow = await prisma.workflow.update({
        where: {
          id: id as string,
        },
        data: {
          managerApprovedAt: null,
          submittedAt: null,
          comments: {
            create: {
              text: reason,
              createdBy: req.session.user.email,
            },
          },
        },
        include: {
          creator: true,
        },
      })
      await notifyReturnedForEdits(
        workflow,
        req.session.user,
        process.env.NEXTAUTH_URL,
        reason
      )
      res.json(workflow)
      break
    }
    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(handler)
