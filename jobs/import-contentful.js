const fetch = require("node-fetch")
const fs = require("fs")
require("dotenv").config()

const slugify = string =>
  string
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s/g, "-")
    .trim()

const removeFalsy = obj => {
  let newObj = {}
  Object.keys(obj).forEach(prop => {
    if (obj[prop]) {
      newObj[prop] = obj[prop]
    }
  })
  return newObj
}

const run = async () => {
  try {
    const res = await fetch(
      `https://cdn.contentful.com/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master/entries?content_type=form&include=10`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
        },
      }
    )
    const data = await res.json()

    const forms = data.items
    const linkedEntries = data?.includes?.Entry

    const getLinkedEntry = ref =>
      linkedEntries.find(entry => entry.sys.id === ref.sys.id)

    const processedForms = forms.map(form => ({
      id: slugify(form.fields.name),
      ...form.fields,
      // themes
      themes: form.fields.themes
        ?.filter(ref => getLinkedEntry(ref))
        ?.map(ref => getLinkedEntry(ref))
        .map(theme => ({
          id: theme.fields.name,
          ...theme.fields,
          // steps
          steps: theme.fields.steps
            ?.filter(ref => getLinkedEntry(ref))
            ?.map(ref => getLinkedEntry(ref))
            .map(step => ({
              id: step.fields.name.trim(),
              ...step.fields,
              // fields
              fields: step.fields.fields
                ?.filter(ref => getLinkedEntry(ref))
                ?.map(ref => getLinkedEntry(ref))
                .map(field => {
                  if (field)
                    return {
                      ...removeFalsy(field.fields),
                      id: field.fields.id || field.fields.question,
                      choices: field?.fields?.choices?.map(choice => ({
                        label: choice,
                        value: choice,
                      })),
                      // subfields
                      subfields: field?.fields?.subfields
                        ?.filter(ref => getLinkedEntry(ref))
                        ?.map(ref => getLinkedEntry(ref))
                        .map(subfield => ({
                          ...subfield.fields,
                          id: subfield.fields.id || subfield.fields.question,
                          choices:
                            subfield?.fields.choices &&
                            subfield?.fields.choices.map(choice => ({
                              label: choice,
                              value: choice,
                            })),
                        })),
                    }
                }),
            })),
        })),
    }))

    fs.writeFileSync(
      "./config/forms/forms.json",
      JSON.stringify(processedForms, null, 2)
    )
    console.log(`✅ ${forms.length} forms done!`)
  } catch (e) {
    console.error(e)
  }
}

run()
