import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../../lib/apiHelpers"
import { notifyReturnedForEdits } from "../../../../lib/notify"
import prisma from "../../../../lib/prisma"

const handler = async (req: ApiRequestWithSession, res: NextApiResponse) => {
  const { id } = req.query

  if (!req.session.user.approver)
    return res
      .status(400)
      .json({ error: "You're not authorised to perform that action" })

  switch (req.method) {
    case "POST": {
      const workflow = await prisma.workflow.update({
        where: {
          id: id as string,
        },
        data: {
          managerApprovedAt: new Date(),
          managerApprovedBy: req.session.user.email,
        },
      })
      res.json(workflow)
      break
    }
    case "DELETE": {
      const { reason } = JSON.parse(req.body)
      const workflow = await prisma.workflow.update({
        where: {
          id: id as string,
        },
        data: {
          submittedAt: null,
          comments: {
            create: {
              text: reason,
              createdBy: req.session.user.email,
            },
          },
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
