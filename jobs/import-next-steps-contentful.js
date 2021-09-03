const fetch = require("node-fetch")
const fs = require("fs")
require("dotenv").config()
const forms = require("../config/forms/forms.json")

const run = async () => {
  try {
    const res = await fetch(
      `https://cdn.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master/entries?content_type=nextStep&include=10`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
        },
      }
    )
    const data = await res.json()

    const nextSteps = data.items
    const linkedEntries = data?.includes?.Entry

    const getLinkedEntry = ref =>
      linkedEntries.find(entry => entry.sys.id === ref.sys.id)

    const processedNextSteps = nextSteps.map(entry => ({
      id: entry.sys.id,

      title: entry.fields["title"],
      description: entry.fields["description"],
      email: entry.fields["email"] || null,
      formIds:
        entry.fields["formsToAppearOn"].map(
          entry =>
            forms.find(form => form.name === getLinkedEntry(entry).fields.name)
              .id
        ).fields || null,
      // workflowToStart: forms.find(
      //   form =>
      //     form.name ===
      //     getLinkedEntry(entry.fields["formsToTrigger"]).fields.name
      // ).id,

      waitForApproval: entry.fields["waitForManagerApproval"],
      createForDifferentPerson: entry.fields["createForDifferentPerson"],
      handoverNote: entry.fields["hasAHandoverNote"],
    }))

    fs.writeFileSync(
      "./config/nextSteps/nextStepOptions.json",
      JSON.stringify(processedNextSteps, null, 2)
    )
    console.log(`✅ ${nextSteps.length} next steps done!`)
  } catch (e) {
    console.error(e)
  }
}

run()
