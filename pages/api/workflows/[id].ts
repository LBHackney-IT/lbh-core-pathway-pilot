import prisma from "../../../lib/prisma"
import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../lib/apiHelpers"

const handler = async (req: ApiRequestWithSession, res: NextApiResponse) => {
  const { id } = req.query

  switch (req.method) {
    case "PATCH": {
      const updatedSubmission = await prisma.workflow.update({
        data: JSON.parse(req.body),
        where: {
          id: id as string,
        },
      })
      res.status(200).json(updatedSubmission)
      break
    }

    case "DELETE": {
      const discardedSubmission = await prisma.workflow.update({
        data: {
          discardedAt: new Date(),
          discardedBy: req.session.user.email,
        },
        where: {
          id: id as string,
        },
      })
      res.status(204).json(discardedSubmission)
      break
    }

    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(handler)
