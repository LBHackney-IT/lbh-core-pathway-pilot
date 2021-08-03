import prisma from "../../../../../lib/prisma"
import { NextApiResponse } from "next"
import {
  apiHandler,
  ApiRequestWithSession,
} from "../../../../../lib/apiHelpers"
import { revisionInterval } from "../../../../../config"

const handler = async (req: ApiRequestWithSession, res: NextApiResponse) => {
  const { id, stepId } = req.query

  switch (req.method) {
    case "PATCH": {
      // grab most recent revision
      const lastRevision = await prisma.revision.findFirst({
        where: {
          workflowId: id as string,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          createdAt: true,
        },
      })

      // was the last revision earlier than the configured interval?
      const shouldSaveRevision = lastRevision
        ? new Date().getTime() - lastRevision?.createdAt?.getTime() >
          revisionInterval
        : true

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
                    answers: {
                      [stepId as string]: JSON.parse(req.body),
                    },
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
