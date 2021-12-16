import prisma from "../../../../../lib/prisma"
import {NextApiRequest, NextApiResponse} from "next"
import {apiHandler} from "../../../../../lib/apiHelpers"
import { revisionInterval } from "../../../../../config"
import { middleware as csrfMiddleware } from "../../../../../lib/csrfToken"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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
          updatedBy: req['user']?.email,
          revisions: shouldSaveRevision
            ? {
                create: [
                  {
                    answers: updatedAnswers,
                    createdBy: req['user']?.email,
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

export default apiHandler(csrfMiddleware(handler))
