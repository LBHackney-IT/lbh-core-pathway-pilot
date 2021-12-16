const fetch = require("node-fetch")
const { PrismaClient } = require("@prisma/client")
const formList = require("../config/forms/forms.json")

require("dotenv").config()

const textFromJson = json => {
  if (json === null || json === undefined) {
    return ""
  }
  if (
    !Array.isArray(json) &&
    // eslint-disable-next-line no-prototype-builtins
    !Object.getPrototypeOf(json).isPrototypeOf(Object)
  ) {
    return "" + json
  }
  const obj = {}
  for (const key of Object.keys(json)) {
    obj[key] = textFromJson(json[key])
  }
  return Object.values(obj).join(" ")
}

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
        workflows.map(w => {
          const form = formList.find(form => form.id === w.formId)

          return {
            resultType: "Workflow",
            id: w.id,
            socialCareId: w.socialCareId,
            addedAt: w.createdAt,
            addedBy: w.submittedBy || w.createdBy,
            title: `${form.name || w.formId} for #${w.socialCareId}`,
            content: textFromJson(w.answers),
          }
        })
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
