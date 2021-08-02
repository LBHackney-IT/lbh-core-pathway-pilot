import prisma from "../../../../../lib/prisma"
import { NextApiResponse } from "next"
import {
  apiHandler,
  ApiRequestWithSession,
} from "../../../../../lib/apiHelpers"

const handler = async (req: ApiRequestWithSession, res: NextApiResponse) => {
  const { id, stepId } = req.query

  switch (req.method) {
    case "PATCH": {
      // grab most recent revision
      const { createdAt: lastRevisionCreatedAt } =
        await prisma.revision.findFirst({
          where: {
            workflowId: id as string,
          },
          orderBy: {
            createdAt: "desc",
          },
        })

      // was the last revision earlier than the configured interval?
      const shouldSaveRevision =
        new Date().getTime() - lastRevisionCreatedAt.getTime() >
        // TODO: replace with real config
        10000

      const updatedWorkflow = await prisma.workflow.update({
        data: {
          answers: {
            [stepId as string]: JSON.parse(req.body),
          },

          // save a revision, conditionally
          revisions: shouldSaveRevision
            ? {
                create: [
                  {
                    createdBy: req.session.user.email,
                    action: "Edited",
                    // TODO: how do we get the full answers here?
                    answers: {},
                  },
                ],
              }
            : undefined,
        },
        where: {
          id: id as string,
        },
      })
      res.status(200).json(updatedWorkflow)
      break
    }

    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(handler)
