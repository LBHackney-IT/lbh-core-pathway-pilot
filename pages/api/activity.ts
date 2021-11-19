import prisma from "../../lib/prisma"
import { NextApiResponse } from "next"
import { apiHandler, ApiRequestWithSession } from "../../lib/apiHelpers"
import { Prisma } from ".prisma/client"
import { middleware as csrfMiddleware } from "../../lib/csrfToken"

const perPage = 30

const revisionForActivityFeed = Prisma.validator<Prisma.RevisionArgs>()({
  include: {
    actor: {
      select: {
        name: true,
      },
    },
    workflow: {
      select: {
        socialCareId: true,
        formId: true,
      },
    },
  },
})
export type RevisionForActivityFeed = Prisma.RevisionGetPayload<
  typeof revisionForActivityFeed
>

export const handler = async (
  req: ApiRequestWithSession,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET": {
      const { page } = req.query as { page: string }

      const revisions = await prisma.revision.findMany({
        take: perPage,
        skip: parseInt(page) > 0 ? parseInt(page) * perPage : 0,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          actor: {
            select: {
              name: true,
            },
          },
          workflow: {
            select: {
              socialCareId: true,
              formId: true,
            },
          },
        },
      })

      res.json(revisions)
      break
    }

    default: {
      res.status(405).json({ error: "Method not supported on this endpoint" })
    }
  }
}

export default apiHandler(csrfMiddleware(handler))
