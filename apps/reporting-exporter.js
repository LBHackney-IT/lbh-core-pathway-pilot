const { PrismaClient } = require("@prisma/client")
const { Transform, Writable } = require("stream")
const { google } = require("googleapis")
const get = require("lodash.get")

const BATCH_SIZE = 200

const REPORTS = require("../config/reports.json")
const {DateTime} = require("luxon");
class Converters {
  static date(input) {
    return DateTime.fromISO(input).toFormat('LLL d, yyyy, h:mm:ss:S a')
  }
}
module.exports.Converters = Converters

class DataExtractor extends Transform {
  report = []

  constructor(report) {
    super()
    this.report = report
  }

  _transform(chunk, encoding, callback) {
    try {
      callback(
        null,
        JSON.stringify(
          this.report.columns.map(col => {
            const value = get(JSON.parse(chunk.toString()), col, "")
            if (value === null) return ""
            if (this.report.conversions.date.includes(col)) return Converters.date(value)

            return value
          })
        )
      )
    } catch (e) {
      callback(e)
    }
  }
}

class StreamToSheet extends Writable {
  items = []
  report
  spreadsheetId

  constructor({ report, sheets }) {
    super()
    this.report = report
    this.sheets = sheets
  }

  _write(chunk, encoding, callback) {
    this.items.push(chunk.toString())

    if (this.items.length >= BATCH_SIZE) {
      this.flush().then(() => callback(null))
    } else {
      callback(null)
    }
  }

  async flush() {
    const { spreadsheetId } = this.report

    const values = this.items
      .splice(0, BATCH_SIZE)
      .map(r =>
        JSON.parse(r).map(value =>
          Array.isArray(value) || typeof value === "object"
            ? JSON.stringify(value)
            : value
        )
      )
      .filter(r => !!r)

    console.log(`[${this.report.name}]`, "sending", values.length, "rows")

    await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${this.report.name}!A1:Z`,
      valueInputOption: "USER_ENTERED",
      resource: { values },
    })
  }
}

const authenticate = async () => {
  const auth = new google.auth.JWT({
    email: process.env.REPORTING_GOOGLE_EMAIL,
    key: process.env.REPORTING_GOOGLE_PRIVATE_KEY,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  })

  await auth.authorize()

  google.options({ auth })
}

const withLogging = stream => {
  if (process.env.DEBUG)
    stream
      .on("data", () => console.log(`${stream.constructor.name}#data`))
      .on("end", () => console.log(`${stream.constructor.name}#end`))
      .on("close", () => console.log(`${stream.constructor.name}#close`))

  return stream
}

const runQuery = async (report, position, connection) => {
  return await connection[report.entity].findMany({
    ...report.query,
    take: BATCH_SIZE,
    skip: position,
  })
}

const queryUntilEmpty = async (report, connection, dataExtractor) => {
  let position = 0
  let more = true

  while (more) {
    const items = await runQuery(report, position, connection)

    if (items.length > 0) {
      console.log(`[${report.name}]`, "adding", items.length, "items")
      for (const item of items) dataExtractor.write(JSON.stringify(item))
      position += BATCH_SIZE
    } else {
      dataExtractor.end()
      more = false
    }
  }
}

const executeReport = (report, connection, sheets) =>
  new Promise((resolve, reject) => {
    console.log(`[${report.name}]`, "starting")

    const dataExtractor = withLogging(new DataExtractor(report))
    const sheetUploader = withLogging(new StreamToSheet({ report, sheets }))

    dataExtractor.pipe(sheetUploader)

    dataExtractor.on("close", () => {
      sheetUploader.flush().then(() => {
        sheetUploader.destroy()
        dataExtractor.destroy()
        resolve()
      })
    })

    sheets.spreadsheets
      .batchUpdate({
        spreadsheetId: report.spreadsheetId,
        resource: {
          requests: [
            {
              updateCells: {
                range: { sheetId: report.sheetId },
                fields: "userEnteredValue",
              },
            },
            {
              updateSheetProperties: {
                fields: "title",
                properties: {
                  sheetId: report.sheetId,
                  title: report.name,
                },
              },
            },
          ],
        },
      })
      .then(() => {
        sheets.spreadsheets.values
          .append({
            spreadsheetId: report.spreadsheetId,
            range: `${report.name}!A1:Z`,
            valueInputOption: "USER_ENTERED",
            resource: {
              values: [report.columns],
            },
          })
          .then(() => {
            queryUntilEmpty(report, connection, dataExtractor).catch(reject)
          })
      })
  })

module.exports.handler = async () => {
  const connection = new PrismaClient()
  const sheets = google.sheets("v4")

  await authenticate()

  await Promise.all(
    REPORTS[process.env.ENVIRONMENT].map(report =>
      executeReport(report, connection, sheets)
    )
  )
}

// if (!module.parent) module.exports.handler().catch(console.error)
