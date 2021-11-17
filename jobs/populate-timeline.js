const { PrismaClient } = require("@prisma/client")
require("dotenv").config()

const { addRecordToCase } = require("../lib/cases")

const run = async () => {
  try {
    console.log("📡 Connecting to DB...")
    const db = new PrismaClient()

    const workflows = await db.workflow.findMany({
      where: {
        type: { not: "Historic" },
        OR: [
          {
            panelApprovedAt: { not: null },
          },
          {
            managerApprovedAt: { not: null },
            needsPanelApproval: false,
          },
        ],
      },
    })

    await Promise.all(
      workflows.map(workflow => {
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
