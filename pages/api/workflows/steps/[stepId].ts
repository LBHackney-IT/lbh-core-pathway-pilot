import prisma from "../../../../lib/prisma"
import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../../lib/apiHelpers"

const handler = async (req: ApiRequestWithSession, res: NextApiResponse) => {
  const { id, stepId } = req.query

  switch (req.method) {
    case "PATCH": {
      const updatedSubmission = await prisma.workflow.update({
        data: {
          answers: {
            [stepId as string]: req.body,
          },
        },
        where: {
          id: id as string,
        },
      })
      res.status(200).json(updatedSubmission)
      break
    }
    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(handler)
