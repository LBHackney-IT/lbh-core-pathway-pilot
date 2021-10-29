const { updateReportingConfig } = require("./update-reporting-config")
const fs = require("fs")

jest.mock("fs", () => ({
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
}))

jest.mock("../config/reports.json", () => {
  const reportsConfigWithoutQuestion3 = require("../fixtures/reports.json")

  return reportsConfigWithoutQuestion3
})

jest.mock("../config/forms/forms.json", () => {
  const { mockForms } = require("../fixtures/form")

  return mockForms
})

const jsonStringify = jest.spyOn(JSON, "stringify")

const consoleLog = console.log
const consoleError = console.error

beforeAll(() => {
  console.log = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  console.log = consoleLog
  console.error = consoleError
})

describe("updateReportingConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("creates config for staging", () => {
    process.env.ENVIRONMENT = "stg"

    updateReportingConfig()

    expect(jsonStringify.mock.calls[0][0]).toEqual(
      expect.objectContaining({ stg: expect.anything() })
    )
  })

  it("creates config for production", () => {
    process.env.ENVIRONMENT = "prod"

    updateReportingConfig()

    expect(jsonStringify.mock.calls[0][0]).toEqual(
      expect.objectContaining({ prod: expect.anything() }),
      null,
      expect.anything()
    )
  })

  it("writes to a file within the config folder", () => {
    updateReportingConfig()

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("./config/"),
      expect.anything()
    )
  })

  describe("for staging", () => {
    beforeEach(() => {
      process.env.ENVIRONMENT = "stg"
    })

    it("logs that config was updated", () => {
      updateReportingConfig()

      expect(console.log).toHaveBeenCalledWith(
        "✅  Updated reporting config for staging!"
      )
    })

    it("creates a report for each form", () => {
      updateReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          stg: expect.arrayContaining([
            expect.objectContaining({ name: "mock-form" }),
            expect.objectContaining({ name: "mock-form-2" }),
            expect.objectContaining({ name: "mock-form-3" }),
          ]),
        })
      )
    })

    it("uses the workflows table for each report", () => {
      updateReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          stg: expect.arrayContaining([
            expect.objectContaining({ entity: "workflow" }),
            expect.objectContaining({ entity: "workflow" }),
            expect.objectContaining({ entity: "workflow" }),
          ]),
        })
      )
    })

    it("sets the spreadsheet ID for each report", () => {
      updateReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          stg: expect.arrayContaining([
            expect.objectContaining({ spreadsheetId: expect.anything() }),
            expect.objectContaining({ spreadsheetId: expect.anything() }),
            expect.objectContaining({ spreadsheetId: expect.anything() }),
          ]),
        })
      )
    })

    it("sets the sheet ID for each report", () => {
      updateReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          stg: expect.arrayContaining([
            expect.objectContaining({ sheetId: expect.anything() }),
            expect.objectContaining({ sheetId: expect.anything() }),
            expect.objectContaining({ sheetId: expect.anything() }),
          ]),
        })
      )
    })

    it("sets the query for each report", () => {
      updateReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          stg: expect.arrayContaining([
            expect.objectContaining({
              query: {
                where: {
                  formId: "mock-form",
                },
              },
            }),
            expect.objectContaining({
              query: {
                where: {
                  formId: "mock-form-2",
                },
              },
            }),
            expect.objectContaining({
              query: {
                where: {
                  formId: "mock-form-3",
                },
              },
            }),
          ]),
        })
      )
    })

    ;[
      "id",
      "type",
      "formId",
      "socialCareId",
      "heldAt",
      "teamAssignedTo",
      "assignedTo",
      "updatedAt",
      "updatedBy",
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
    ].forEach(column => {
      it(`asks for the ${column} column in a workflow`, () => {
        updateReportingConfig()

        expect(jsonStringify.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            stg: expect.arrayContaining([
              expect.objectContaining({
                columns: expect.arrayContaining([column]),
              }),
              expect.objectContaining({
                columns: expect.arrayContaining([column]),
              }),
              expect.objectContaining({
                columns: expect.arrayContaining([column]),
              }),
            ]),
          })
        )
      })
    })

    it("asks for all the properties in the answers column of a workflow", () => {
      const answersColumns = [
        "answers.mock-step.mock-question",
        "answers.mock-step-2.mock-question-2",
        "answers.mock-step-3.mock-question-3",
      ]

      updateReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          stg: expect.arrayContaining([
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
          ]),
        })
      )
    })

    it("only makes changes for staging if existing production reporting config", () => {
      const answersColumns = [
        "answers.mock-step.mock-question",
        "answers.mock-step-2.mock-question-2",
        "answers.mock-step-3.mock-question-3",
      ]

      updateReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          stg: expect.arrayContaining([
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
          ]),
          prod: expect.arrayContaining([
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns.slice(0, -1)),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns.slice(0, -1)),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns.slice(0, -1)),
            }),
          ]),
        })
      )
    })
  })

  describe("for production", () => {
    beforeEach(() => {
      process.env.ENVIRONMENT = "prod"
    })

    it("logs that config was updated", () => {
      updateReportingConfig()

      expect(console.log).toHaveBeenCalledWith(
        "✅  Updated reporting config for production!"
      )
    })

    it("creates a report for each form", () => {
      updateReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          prod: expect.arrayContaining([
            expect.objectContaining({ name: "mock-form" }),
            expect.objectContaining({ name: "mock-form-2" }),
            expect.objectContaining({ name: "mock-form-3" }),
          ]),
        })
      )
    })

    it("uses the workflows table for each report", () => {
      updateReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          prod: expect.arrayContaining([
            expect.objectContaining({ entity: "workflow" }),
            expect.objectContaining({ entity: "workflow" }),
            expect.objectContaining({ entity: "workflow" }),
          ]),
        })
      )
    })

    it("sets the spreadsheet ID for each report", () => {
      updateReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          prod: expect.arrayContaining([
            expect.objectContaining({ spreadsheetId: expect.anything() }),
            expect.objectContaining({ spreadsheetId: expect.anything() }),
            expect.objectContaining({ spreadsheetId: expect.anything() }),
          ]),
        })
      )
    })

    it("sets the sheet ID for each report", () => {
      updateReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          prod: expect.arrayContaining([
            expect.objectContaining({ sheetId: expect.anything() }),
            expect.objectContaining({ sheetId: expect.anything() }),
            expect.objectContaining({ sheetId: expect.anything() }),
          ]),
        })
      )
    })

    it("sets the query for each report", () => {
      updateReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          prod: expect.arrayContaining([
            expect.objectContaining({
              query: {
                where: {
                  formId: "mock-form",
                },
              },
            }),
            expect.objectContaining({
              query: {
                where: {
                  formId: "mock-form-2",
                },
              },
            }),
            expect.objectContaining({
              query: {
                where: {
                  formId: "mock-form-3",
                },
              },
            }),
          ]),
        })
      )
    })

    ;[
      "id",
      "type",
      "formId",
      "socialCareId",
      "heldAt",
      "teamAssignedTo",
      "assignedTo",
      "updatedAt",
      "updatedBy",
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
    ].forEach(column => {
      it(`asks for the ${column} column in a workflow`, () => {
        updateReportingConfig()

        expect(jsonStringify.mock.calls[0][0]).toEqual(
          expect.objectContaining({
            prod: expect.arrayContaining([
              expect.objectContaining({
                columns: expect.arrayContaining([column]),
              }),
              expect.objectContaining({
                columns: expect.arrayContaining([column]),
              }),
              expect.objectContaining({
                columns: expect.arrayContaining([column]),
              }),
            ]),
          })
        )
      })
    })

    it("asks for all the properties in the answers column of a workflow", () => {
      const answersColumns = [
        "answers.mock-step.mock-question",
        "answers.mock-step-2.mock-question-2",
        "answers.mock-step-3.mock-question-3",
      ]

      updateReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          prod: expect.arrayContaining([
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
          ]),
        })
      )
    })

    it("only makes changes for production", () => {
      const answersColumns = [
        "answers.mock-step.mock-question",
        "answers.mock-step-2.mock-question-2",
        "answers.mock-step-3.mock-question-3",
      ]

      updateReportingConfig()

      expect(jsonStringify.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          stg: expect.arrayContaining([
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns.slice(0, -1)),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns.slice(0, -1)),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns.slice(0, -1)),
            }),
          ]),
          prod: expect.arrayContaining([
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
            expect.objectContaining({
              columns: expect.arrayContaining(answersColumns),
            }),
          ]),
        })
      )
    })
  })
})
