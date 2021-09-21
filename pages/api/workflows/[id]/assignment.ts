import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../../../lib/apiHelpers"
import prisma from "../../../../lib/prisma"

const handler = async (req: ApiRequestWithSession, res: NextApiResponse) => {
  const id = req.query.id

  switch (req.method) {
    case "PATCH": {
      const values = JSON.parse(req.body)

      const workflow = await prisma.workflow.update({
        data: {
          assignedTo: values.assignedTo,
          teamAssignedTo: values.teamAssignedTo,
          revisions: {
            create: [
              {
                answers: {
                  assignedTo: values.assignedTo,
                  teamAssignedTo: values.teamAssignedTo,
                },
                createdBy: req?.session?.user?.email,
                action: "Reassigned",
              },
            ],
          },
        },
        where: {
          id: id as string,
        },
      })
      res.status(200).json(workflow)

      break
    }

    case "GET": {
      const workflow = await prisma.workflow.findUnique({
        where: { id: id as string },
        select: {
          assignee: true,
          teamAssignedTo: true,
        },
      })
      res.json(workflow)
      break
    }

    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(handler)
