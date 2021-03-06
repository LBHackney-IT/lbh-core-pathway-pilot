import prisma from "../../../../lib/prisma"
import {NextApiRequest, NextApiResponse} from "next"
import { apiHandler } from "../../../../lib/apiHelpers"
import { middleware as csrfMiddleware } from "../../../../lib/csrfToken"
import { Team } from "@prisma/client"
import { DateTime, Duration } from "luxon"

export interface TeamKpis {
  last30Days: {
    started: number
    submitted: number
    completed: number
    turnaroundTime: number
  }
  prev30Days: {
    started: number
    submitted: number
    completed: number
    turnaroundTime: number
  }
}

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  switch (req.method) {
    case "GET": {
      const { id } = req.query

      const team = Object.values(Team).find(
        team => (id as string).toLowerCase() === team.toLowerCase()
      )

      if (!team) return res.status(404).json({ error: "That team does not exist" })

      const thirtyDaysAgo = DateTime.now()
        .minus(
          Duration.fromObject({
            days: 30,
          })
        )
        .toISO()
      const sixtyDaysAgo = DateTime.now()
        .minus(
          Duration.fromObject({
            days: 60,
          })
        )
        .toISO()

      const [
        started,
        submitted,
        completed,
        rawTurnaroundTime,
        startedPrev,
        submittedPrev,
        completedPrev,
      ] = await Promise.all([
        await prisma.workflow.count({
          where: {
            teamSubmittedBy: team,
            createdAt: {
              gte: thirtyDaysAgo,
            },
          },
        }),
        await prisma.workflow.count({
          where: {
            teamSubmittedBy: team,
            submittedAt: {
              gte: thirtyDaysAgo,
            },
          },
        }),
        await prisma.workflow.count({
          where: {
            teamSubmittedBy: team,
            OR: [
              {
                panelApprovedAt: {
                  gte: thirtyDaysAgo,
                },
              },
              {
                managerApprovedAt: {
                  gte: thirtyDaysAgo,
                },
                needsPanelApproval: false,
              },
            ],
          },
        }),

        await prisma.$queryRaw`SELECT TO_CHAR(AVG("managerApprovedAt" - "createdAt"), 'DD') AS "meanTimeToApproval"
                               FROM "Workflow"
                               WHERE "managerApprovedAt" IS NOT null
                                 AND "teamSubmittedBy" = ${team}`,

        // prev 30 days

        await prisma.workflow.count({
          where: {
            teamSubmittedBy: team,
            createdAt: {
              gte: sixtyDaysAgo,
              lte: thirtyDaysAgo,
            },
          },
        }),
        await prisma.workflow.count({
          where: {
            teamSubmittedBy: team,
            submittedAt: {
              gte: sixtyDaysAgo,
              lte: thirtyDaysAgo,
            },
          },
        }),
        await prisma.workflow.count({
          where: {
            teamSubmittedBy: team,
            OR: [
              {
                panelApprovedAt: {
                  gte: sixtyDaysAgo,
                  lte: thirtyDaysAgo,
                },
              },
              {
                managerApprovedAt: {
                  gte: sixtyDaysAgo,
                  lte: thirtyDaysAgo,
                },
                needsPanelApproval: false,
              },
            ],
          },
        }),
      ])

      res.status(200).json({
        last30Days: {
          started,
          submitted,
          completed,
          turnaroundTime: parseInt(rawTurnaroundTime[0].meanTimeToApproval),
        },
        prev30Days: {
          started: startedPrev,
          submitted: submittedPrev,
          completed: completedPrev,
        },
      })
      break
    }

    default: {
      res.status(405).json({ error: `${req.method} not supported on this endpoint` })
    }
  }
}

export default apiHandler(csrfMiddleware(handler))
