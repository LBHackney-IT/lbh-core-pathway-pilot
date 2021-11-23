import fetch from "node-fetch"
import { PrismaClient } from ".prisma/client"
import { addRecordToCase } from "../lib/cases"
import { config } from "dotenv"

config()

const dayWeLaunchedTimelineIntegration = new Date(2021, 10, 17, 14, 0, 0, 0)

// look for records submitted by this user and for the same social care id
const getCasesByWorkerAndId = async (worker_email, mosaic_id, cursor) => {
  const res = await fetch(
    `${process.env.SOCIAL_CARE_API_ENDPOINT}/cases?worker_email=${worker_email}&mosaic_id=${mosaic_id}&cursor=${cursor}`,
    {
      headers: {
        "x-api-key": process.env.SOCIAL_CARE_API_KEY,
        "Content-Type": "application/json",
      },
    }
  )
  return await res.json()
}

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
        let cursor = "0"
        let cases = []

        while (cursor !== null) {
          const pageOfCases = await getCasesByWorkerAndId(
            workflow.submittedBy,
            workflow.socialCareId,
            cursor
          )
          cursor = pageOfCases.nextCursor
          cases = cases.concat(pageOfCases.cases)
        }

        const existingRecord =
          cases?.length > 0 &&
          cases.find(c => c.caseFormData.workflowId === workflow.id)

        if (existingRecord)
          return console.log(
            `Case likely already exists for workflow ${workflow.id}. Skipping...`
          )

        await addRecordToCase(workflow)
        console.log(`Added case for workflow ${workflow.id}`)
      })
    )

    console.log(`✅ Done: ${workflows.length} processed`)
  } catch (e) {
    console.log(e)
  }
}

module.exports.handler = run
