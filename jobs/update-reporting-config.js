const fs = require("fs")
const forms = require("../config/forms/forms.json")
const currentConfig = require("../config/reports.json")

require("dotenv").config()

const flattenSteps = element =>
  element.themes.reduce((acc, theme) => acc.concat(theme.steps), [])

const answersColumns = form =>
  flattenSteps(form).reduce((columns, step) => {
    step.fields.forEach(field => columns.push(`answers.${step.id}.${field.id}`))
    return columns
  }, [])

const stagingSheetIdMap = {
  'initial-contact-assessment': '785461944',
  'carers-assessment': '1768098873',
  'care-act-assessment': '340927201',
  'mental-capacity-assessment': '1730612632',
  'determination-of-best-interests': '1594867248',
  'sensory-assessment': '66317467',
  'occupational-therapy-assessment': '1210799932',
  'mock-form': '1',
  'mock-form-2': '2',
  'mock-form-3': '3',
};
const stagingConfig = forms.map((form) => ({
  name: form.id,
  entity: "workflow",
  spreadsheetId: "1OofFEjFxivKDYZVSAzMwf-MdpfBGPLNH7me4wSQKGO8",
  sheetId: stagingSheetIdMap[form.id],
  query: {
    where: { formId: form.id, NOT: { type: "Historic" } },
  },
  conversions: {
    date: [
      "heldAt",
      "createdAt",
      "submittedAt",
      "managerApprovedAt",
      "panelApprovedAt",
      "discardedAt",
      "updatedAt",
    ],
  },
  columns: [
    "id",
    "type",
    "formId",
    "socialCareId",
    "heldAt",
    "teamAssignedTo",
    "assignedTo",
    "createdAt",
    "createdBy",
    "submittedAt",
    "submittedBy",
   "teamSubmittedBy",
    "managerApprovedAt",
    "managerApprovedBy",
    "needsPanelApproval",
    "panelApprovedAt",
    "panelApprovedBy",
    "discardedAt",
    "discardedBy",
    "updatedAt",
    "updatedBy",
    ...answersColumns(form),
  ],
}))
  .filter(form => !!form.sheetId);

const productionSheetIdMap = {
  'initial-contact-assessment': '1184483714',
  'carers-assessment': '1629207012',
  'care-act-assessment': '616771756',
  'mental-capacity-assessment': '670587857',
  'determination-of-best-interests': '1154978324',
  'sensory-assessment': '958867101',
  'occupational-therapy-assessment': '40059613',
  'mock-form': '1',
  'mock-form-2': '2',
  'mock-form-3': '3',
};
const productionConfig = forms.map((form) => ({
  name: form.id,
  entity: "workflow",
  spreadsheetId: "1OuPEweyz-cboOV5MW16zJHG44LZBbBFEkmbMfX4kxHo",
  sheetId: productionSheetIdMap[form.id],
  query: {
    where: { formId: form.id, NOT: { type: "Historic" } },
  },
  conversions: {
    date: [
      "heldAt",
      "createdAt",
      "submittedAt",
      "managerApprovedAt",
      "panelApprovedAt",
      "discardedAt",
      "updatedAt",
    ],
  },
  columns: [
    "id",
    "type",
    "formId",
    "socialCareId",
    "heldAt",
    "teamAssignedTo",
    "assignedTo",
    "createdAt",
    "createdBy",
    "submittedAt",
    "submittedBy",
    "teamSubmittedBy",
    "managerApprovedAt",
    "managerApprovedBy",
    "needsPanelApproval",
    "panelApprovedAt",
    "panelApprovedBy",
    "discardedAt",
    "discardedBy",
    "updatedAt",
    "updatedBy",
    ...answersColumns(form),
  ],
}))
  .filter(form => !!form.sheetId);

const updateReportingConfig = () => {
  try {
    const environment =
      process.env.ENVIRONMENT === "prod" ? "production" : "staging"
    const updatedConfig = currentConfig

    if (environment === "production") {
      updatedConfig.prod = productionConfig
    } else {
      updatedConfig.stg = stagingConfig
    }

    fs.writeFileSync(
      "./config/reports.json",
      JSON.stringify(updatedConfig, null, 2)
    )
    console.log(`✅  Updated reporting config for ${environment}!`)
  } catch (e) {
    console.error(e)
  }
}

if (process.env.ENVIRONMENT === "prod" || process.env.ENVIRONMENT === "stg") {
  updateReportingConfig()
}

module.exports.updateReportingConfig = updateReportingConfig
