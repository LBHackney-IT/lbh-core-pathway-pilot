import {NextApiRequest, NextApiResponse} from "next"
import { apiHandler } from "../../../../lib/apiHelpers"
import { middleware as csrfMiddleware } from "../../../../lib/csrfToken"
import prisma from "../../../../lib/prisma"
import { acknowledgementSchema } from "../../../../lib/validators"

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { id } = req.query
  const values = JSON.parse(req.body)

  await acknowledgementSchema.validate(values)

  switch (req.method) {
    case "POST": {
      const updatedWorkflow = await prisma.workflow.update({
        where: {
          id: id as string,
        },
        data: {
          acknowledgedAt: new Date(),
          acknowledgedBy: req['user']?.email,
          acknowledgingTeam: values.financeTeam,
        },
      })

      res.json(updatedWorkflow)
      break
    }

    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(csrfMiddleware(handler))
