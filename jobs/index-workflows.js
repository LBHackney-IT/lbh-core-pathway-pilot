const fetch = require("node-fetch")
const { PrismaClient } = require("@prisma/client")

require("dotenv").config()

/** add workflows to the search index so they can be discovered */
const run = async () => {
  try {
    console.log("📡 Connecting to DB...")
    const db = new PrismaClient()

    const workflows = await db.workflow.findMany({
      where: {
        discardedAt: null,
      },
      select: {
        id: true,
        socialCareId: true,
        submittedBy: true,
        createdAt: true,
        createdBy: true,
        formId: true, // title
        answers: true, // content
      },
    })

    const res = await fetch(process.env.SEARCH_API_ENDPOINT, {
      method: "POST",
      headers: {
        "x-api-key": process.env.SEARCH_API_KEY,
      },
      body: JSON.stringify(
        workflows.map(w => ({
          type: "Workflow",
          id: w.id,
          socialCareId: w.socialCareId,
          addedAt: w.createdAt,
          addedBy: w.submittedBy || w.createdBy,
          title: `${w.formId} for #${w.socialCareId}`,
          content: JSON.stringify(w.answers),
        }))
      ),
    })

    if (res.status !== 201) throw await res.text()

    console.log(`✅ Done: indexed ${workflows.length} workflows`)
  } catch (e) {
    console.error(e)
  }
  process.exit()
}

run()
