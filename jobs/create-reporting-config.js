const fs = require("fs")
const forms = require("../config/forms/forms.json")

const flattenSteps = element =>
  element.themes.reduce((acc, theme) => acc.concat(theme.steps), [])

const answersColumns = form =>
  flattenSteps(form).reduce((columns, step) => {
    step.fields.forEach(field => columns.push(`answers.${step.id}.${field.id}`))
    return columns
  }, [])

const stagingSheetIds = ["1768098873", "785461944", "340927201"]
const stagingConfig = forms.map((form, index) => ({
  name: form.id,
  entity: "workflow",
  spreadsheetId: "1OofFEjFxivKDYZVSAzMwf-MdpfBGPLNH7me4wSQKGO8",
  sheetId: stagingSheetIds[index],
  query: {},
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

const productionSheetIds = ["0", "1184483714", "616771756"]
const productionConfig = forms.map((form, index) => ({
  name: form.id,
  entity: "workflow",
  spreadsheetId: "1OuPEweyz-cboOV5MW16zJHG44LZBbBFEkmbMfX4kxHo",
  sheetId: productionSheetIds[index],
  query: {},
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

const createReportingConfig = () => {
  const config = {
    stg: stagingConfig,
    prod: productionConfig,
  }

  fs.writeFileSync("./config/reports.json", JSON.stringify(config, null, 2))
}

try {
  createReportingConfig()
  console.log(`✅  Created reporting config!`)
} catch (e) {
  console.error(e)
}

module.exports.createReportingConfig = createReportingConfig
