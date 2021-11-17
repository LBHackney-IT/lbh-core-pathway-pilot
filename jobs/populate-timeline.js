const { PrismaClient } = require("@prisma/client")
require("dotenv").config()

const { addRecordToCase } = require("../lib/cases")

const dayWeLaunchedTimelineIntegration = new Date(2021, 10, 17, 14, 0, 0, 0)

const run = async () => {
  try {
    console.log("📡 Connecting to DB...")
    const db = new PrismaClient()

    const workflows = await db.workflow.findMany({
      where: {
        type: { not: "Historic" },
        OR: [
          {
            panelApprovedAt: {
              not: null,
              lt: dayWeLaunchedTimelineIntegration,
            },
          },
          {
            managerApprovedAt: {
              not: null,
              lt: dayWeLaunchedTimelineIntegration,
            },
            needsPanelApproval: false,
          },
        ],
      },
    })

    await Promise.all(
      workflows.map(async workflow => {
        await addRecordToCase(workflow, workflow.createdBy)
      })
    )

    console.log(`✅ Done: ${workflows.length} cases added`)
  } catch (e) {
    console.log(e)
  }
  process.exit()
}

run()

module.exports.handler = async () => await run()
