import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../../lib/apiHelpers"
import { middleware as csrfMiddleware } from "../../../../lib/csrfToken"
import prisma from "../../../../lib/prisma"

export const handler = async (
  req: ApiRequestWithSession,
  res: NextApiResponse
): Promise<void> => {
  const { id } = req.query

  switch (req.method) {
    case "POST": {
      const updatedWorkflow = await prisma.workflow.update({
        where: {
          id: id as string,
        },
        data: {
          acknowledgedAt: new Date(),
          acknowledgedBy: req?.session?.user?.email,
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
