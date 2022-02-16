const { handler: reportingHandler, Converters } = require("./reporting-exporter")
const { google } = require("googleapis")
const { PrismaClient } = require("@prisma/client")



jest.mock("@prisma/client")
jest.mock("googleapis")
jest.mock("../config/reports.json", () => ({
  test: [
    {
      name: "test-data",
      spreadsheetId: "12345abcde",
      entity: "test",
      sheetId: "123456",
      query: {},
      conversions: {date: ["date.iso"]},
      columns: [
        "id",
        "string",
        "json.string",
        "json.null",
        "json.undefined",
        "arrayOfStrings",
        "arrayOfObjects",
        "deeplyNestedObjects",
        "date.iso",
      ],
    },
  ],
}))

process.env.REPORTING_GOOGLE_EMAIL = "test@services.account"
process.env.REPORTING_GOOGLE_PRIVATE_KEY = "test-secret-key"
process.env.ENVIRONMENT = "test"
process.env.DEBUG = "true"

const mockAuthorize = jest.fn().mockResolvedValue({})
google.auth.JWT.mockImplementation(() => ({
  authorize: mockAuthorize,
}))

const mockFindMany = jest
  .fn()
  .mockResolvedValueOnce([
    {
      id: "a",
      string: "string",
      json: { string: "string", null: null },
      arrayOfStrings: ["string1", "string2"],
      arrayOfObjects: [{ prop1: "value1", prop2: "value2" }],
      deeplyNestedObjects: {
        prop: {
          nestedProp: { anotherNestedProp: { lastNestedProp: "value" } },
        },
      },
      date: {iso: "2020-07-10T15:00:00.050" },
    },
  ])
  .mockResolvedValue([])
PrismaClient.mockImplementation(() => ({
  test: {
    findMany: mockFindMany,
  },
}))

const mockBatchUpdate = jest.fn().mockResolvedValue({})
const mockValuesAppend = jest.fn().mockResolvedValue({})
google.sheets = jest.fn().mockImplementation(() => ({
  spreadsheets: {
    batchUpdate: mockBatchUpdate,
    values: {
      append: mockValuesAppend,
    },
  },
}))

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

describe("convert to correct date format", () => {
  test("it converts from ISO to formatted date time", () => {
    expect(Converters.date("2020-07-10T15:00:00.050")).toEqual("Jul 10, 2020, 3:00:00:50 PM")
  })
})
describe("when extracting data from a single table", () => {
  describe("normal operation", () => {
    beforeAll(async () => await reportingHandler())

    test("creates an appropriate JWT instance", () => {
      expect(google.auth.JWT).toHaveBeenCalledWith({
        email: "test@services.account",
        key: "test-secret-key",
        scopes: [
          "https://www.googleapis.com/auth/drive",
          "https://www.googleapis.com/auth/drive.file",
          "https://www.googleapis.com/auth/spreadsheets",
        ],
      })
    })

    test("makes a call to google auth", () => {
      expect(mockAuthorize).toHaveBeenCalled()
    })

    test("logs that the report has started", () => {
      expect(console.log).toHaveBeenCalledWith("[test-data]", "starting")
    })

    test("runs queries until there are no more records", () => {
      expect(mockFindMany).toHaveBeenCalledTimes(2)
    })

    test("deletes all records from the google sheet", () => {
      expect(mockBatchUpdate).toHaveBeenCalledWith({
        spreadsheetId: "12345abcde",
        resource: {
          requests: expect.arrayContaining([
            {
              updateCells: {
                fields: "userEnteredValue",
                range: { sheetId: "123456" },
              },
            },
          ]),
        },
      })
    })

    test("ensures that the sheet has the right title", () => {
      expect(mockBatchUpdate).toHaveBeenCalledWith({
        spreadsheetId: "12345abcde",
        resource: {
          requests: expect.arrayContaining([
            {
              updateSheetProperties: {
                fields: "title",
                properties: {
                  sheetId: "123456",
                  title: "test-data",
                },
              },
            },
          ]),
        },
      })
    })

    test("adds headers to the correct sheet", () => {
      expect(mockValuesAppend).toHaveBeenCalledWith({
        range: "test-data!A1:Z",
        resource: {
          values: [
            [
              "id",
              "string",
              "json.string",
              "json.null",
              "json.undefined",
              "arrayOfStrings",
              "arrayOfObjects",
              "deeplyNestedObjects",
              "date.iso"
            ],
          ],
        },
        spreadsheetId: "12345abcde",
        valueInputOption: "USER_ENTERED",
      })
    })

    test("appends data to the correct sheet", () => {
      expect(mockValuesAppend).toHaveBeenCalledWith({
        range: "test-data!A1:Z",
        resource: {
          values: [
            [
              "a",
              "string",
              "string",
              "",
              "",
              '["string1","string2"]',
              '[{"prop1":"value1","prop2":"value2"}]',
              '{"prop":{"nestedProp":{"anotherNestedProp":{"lastNestedProp":"value"}}}}',
              'Jul 10, 2020, 3:00:00:50 PM'
            ],
          ],
        },

        spreadsheetId: "12345abcde",
        valueInputOption: "USER_ENTERED",
      })
    })
  })
})
