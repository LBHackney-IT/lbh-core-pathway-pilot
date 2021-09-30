const path = require('path');
const {PrismaClient} = require("@prisma/client");
const {Readable, Transform, Writable} = require("stream");
const {google} = require('googleapis');
const get = require('lodash.get');

const BATCH_SIZE = 100;
const SPREADSHEET_ID = "1DXa-agYwNjs_d6EqmBt8Jlez5UwlMvnOBe9CSzvbdGE";
const WORKFLOW_COLUMNS = [
  'id',
  'type',
  'formId',
  'socialCareId',
  'createdBy',
  'createdAt',
  'answers.mock-step.mock-question',
];

const connection = new PrismaClient();
const sheets = google.sheets('v4');

const readableStreamFromTable = (table) => {
  let cursorId = undefined;

  return new Readable({
    objectMode: true,
    async read() {
      try {
        const items = await connection[table].findMany({
          take: BATCH_SIZE,
          skip: cursorId ? 1 : 0,
          cursor: cursorId ? {id: cursorId} : undefined,
        })
        if (items.length === 0) {
          this.push(null);
        } else {
          for (const item of items) {
            this.push(JSON.stringify(item))
          }
          cursorId = items[items.length - 1].id
        }
      } catch (err) {
        this.destroy(err)
      }
    }
  })
};

class DataExtractor extends Transform {
  columns = [];

  constructor(columns) {
    super();
    this.columns = columns;
  }

  _transform(chunk, encoding, callback) {
    const data = JSON.parse(chunk.toString());

    const extracted = Object.fromEntries(this.columns.map(col => [col, get(data, col, '')]))

    callback(null, JSON.stringify(extracted));
  }
}

class ArrayTransformer extends Transform {
  _transform(chunk, encoding, callback) {
    try {
      callback(
        null,
        Buffer.from(
          JSON.stringify(
            Object.values(
              JSON.parse(chunk.toString())
            )
          )
        )
      );
    } catch (e) {
      callback(e);
    }
  }
}

class StreamToSheet extends Writable {
  buffer;
  spreadsheetId;

  constructor({spreadsheetId}) {
    super();
    this.spreadsheetId = spreadsheetId;
    this.buffer = Buffer.from("");
  }

  async _write(chunk, encoding, callback) {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(chunk.toString())]);

    if (Buffer.byteLength(this.buffer) > BATCH_SIZE)
      await this.flush();

    callback();
  }

  async flush() {
    const {spreadsheetId} = this;

    const values = this.buffer.toString()
      .split("\n")
      .map(r => JSON.parse(r));

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "A2:Z",
      valueInputOption: "USER_ENTERED",
      resource: {values}
    });

    this.buffer = Buffer.from("");
  }
}

const getReportingData = async () => {
  const auth = new google.auth.JWT({
    keyFile: path.join(__dirname, 'service-account.json'),
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  await auth.authorize();

  google.options({auth});

  await sheets.spreadsheets.values.batchClear({
    spreadsheetId: SPREADSHEET_ID,
    resource: {ranges: ['A1:Z']},
  });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "A1:Z",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [WORKFLOW_COLUMNS]
    }
  });

  function logger(stream) {
    return function () {
      if (process.env.DEBUG === 'true') console.log(stream, arguments)
    }
  }

  const workFlowsStream = readableStreamFromTable('workflow')
    .on('data', logger('workFlowsStream:data'))
    .on('end', logger('workFlowsStream:end'))
    .on('close', logger('workFlowsStream:close'));

  await workFlowsStream
    .pipe(
      new DataExtractor(WORKFLOW_COLUMNS, workFlowsStream)
        .on('data', logger('DataExtractor:data'))
        .on('end', logger('DataExtractor:end'))
        .on('close', logger('DataExtractor:close'))
    )
    .pipe(
      new ArrayTransformer()
        .on('data', logger('ArrayTransformer:data'))
        .on('end', logger('ArrayTransformer:end'))
        .on('close', logger('ArrayTransformer:close'))
    )
    .pipe(
      new StreamToSheet({spreadsheetId: SPREADSHEET_ID})
        .on('data', logger('StreamToSheet:data'))
        .on('end', logger('StreamToSheet:end'))
        .on('close', logger('StreamToSheet:close'))
    );

  return null;
};

getReportingData().then(() => console.log('then called')).catch(e => console.log(e));
