const fetch = require("node-fetch")
const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
require("dotenv").config()
const { setTimeout } = require("timers/promises")

const run = async () => {
  try {
    console.log("📡 Connecting to DB...")
    const db = new PrismaClient()

    const workflows =
      await db.$queryRaw`SELECT DISTINCT "socialCareId" FROM "Workflow"`
    const ids = workflows.map(workflow => workflow.socialCareId)

    const fails = []
    console.log(`📑 ${ids.length} social care IDs to check`)

    for (let index = 0; index < ids.length; index++) {
      const id = ids[index]

      console.log(`Checking ${id}...`)

      await setTimeout(100)

      const res = await fetch(
        `${process.env.SOCIAL_CARE_API_ENDPOINT}/residents?mosaic_id=${id}`,
        {
          headers: {
            "x-api-key": process.env.SOCIAL_CARE_API_KEY,
          },
        }
      )
      const data = await res.json()
      const resident = data.residents?.find(
        resident => resident.mosaicId === String(id)
      )

      if (resident) {
        console.log(`...match found`)
      } else {
        console.log(`...NO MATCH`)
        fails.push(id)
      }
    }

    console.log(`✅ Done: ${fails.length} IDs are orphans`)
    fs.writeFileSync("orphan-ids.json", JSON.stringify(fails, null, 2))
  } catch (e) {
    console.log(e)
  }
  process.exit()
}

run()
