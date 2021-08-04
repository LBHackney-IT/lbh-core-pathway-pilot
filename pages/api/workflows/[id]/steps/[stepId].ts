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
      // 1. grab workflow and most recent revision
      const workflow = await prisma.workflow.findUnique({
        where: { id: id as string },
        include: {
          revisions: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              createdAt: true,
            },
          },
        },
      })

      // 2. was the last revision earlier than the configured interval?
      const lastRevision = workflow.revisions?.[0]
      const shouldSaveRevision = lastRevision
        ? new Date().getTime() - lastRevision?.createdAt?.getTime() >
          revisionInterval
        : true

      // 3. mix new answers in with existing
      const updatedAnswers = workflow.answers || {}
      updatedAnswers[stepId.toString()] = JSON.parse(req.body)

      // 4. update workflow and save a revision, conditionally
      const updatedWorkflow = await prisma.workflow.update({
        data: {
          answers: updatedAnswers,
          updatedBy: req.session.user.email,
          // if it was held, take it off hold
          heldAt: null,
          revisions: shouldSaveRevision
            ? {
                create: [
                  {
                    action: "Edited",
                    answers: updatedAnswers,
                    createdBy: req.session.user.email,
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
