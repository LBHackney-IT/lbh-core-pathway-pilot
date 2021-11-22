const { PrismaClient, Team } = require("@prisma/client")
const { DateTime } = require("luxon")
const { Duration } = require("luxon")
require("dotenv").config()

const run = async () => {
  try {
    console.log("📡 Connecting to DB...")
    const db = new PrismaClient()

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

    await Promise.all(
      Object.values(Team).map(async team => {
        const [
          started,
          submitted,
          completed,
          rawTurnaroundTime,
          startedPrev,
          submittedPrev,
          completedPrev,
        ] = await Promise.all([
          await db.workflow.count({
            where: {
              teamAssignedTo: team,
              createdAt: {
                gte: thirtyDaysAgo,
              },
            },
          }),
          await db.workflow.count({
            where: {
              teamAssignedTo: team,
              submittedAt: {
                gte: thirtyDaysAgo,
              },
            },
          }),
          await db.workflow.count({
            where: {
              teamAssignedTo: team,
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
          await db.$queryRaw(`SELECT 
              TO_CHAR(AVG("managerApprovedAt" - "createdAt"), 'DD') AS "meanTimeToApproval"
              FROM "Workflow"
              WHERE "managerApprovedAt" IS NOT null 
              AND "teamAssignedTo" = '${team}'
              `),
          // prev 30 days
          await db.workflow.count({
            where: {
              teamAssignedTo: team,
              createdAt: {
                gte: sixtyDaysAgo,
                lte: thirtyDaysAgo,
              },
            },
          }),
          await db.workflow.count({
            where: {
              teamAssignedTo: team,
              submittedAt: {
                gte: sixtyDaysAgo,
                lte: thirtyDaysAgo,
              },
            },
          }),
          await db.workflow.count({
            where: {
              teamAssignedTo: team,
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

        const kpis = {
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
        }

        db.performanceIndicators.upsert({
          where: {
            team,
          },
          create: kpis,
          update: kpis,
        })
      })
    )

    console.log(`✅ Done`)
  } catch (e) {
    console.log(e)
  }
  process.exit()
}

module.exports.handler = async () => await run()
