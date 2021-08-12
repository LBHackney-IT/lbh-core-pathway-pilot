import { NextApiRequest, NextApiResponse } from "next"
import { apiHandler } from "../../../../lib/apiHelpers"
import prisma from "../../../../lib/prisma"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const workflow = await prisma.workflow.findUnique({
    where: { id: req.query.id as string },
    select: {
      assignee: true,
      // assignedTeam: true,
    },
  })
  res.json(workflow)
}

export default apiHandler(handler)
