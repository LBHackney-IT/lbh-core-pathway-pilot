const fetch = require("node-fetch")
const { PrismaClient } = require("@prisma/client")
const { addRecordToCase } = require("../lib/cases")
require("dotenv").config()

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
        // look for records submitted by this user and for the same social care id
        const res = await fetch(
          `${process.env.SOCIAL_CARE_API_ENDPOINT}/cases?worker_email=${workflow.submittedBy}&mosaic_id=${workflow.socialCareId}`,
          {
            headers: {
              "x-api-key": process.env.SOCIAL_CARE_API_KEY,
              "Content-Type": "application/json",
            },
          }
        )
        const data = await res.json()

        const existingRecord =
          data?.cases?.length > 0 &&
          data.cases.find(c => c.caseFormData.workflowId === workflow.id)

        if (existingRecord)
          return console.log(
            `Case likely already exists for workflow ${workflow.id}. Skipping...`
          )

        await addRecordToCase(workflow)
        console.log(`Added case for workflow ${workflow.id}`)
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
