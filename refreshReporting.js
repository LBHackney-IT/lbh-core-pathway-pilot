const path = require('path');
const {PrismaClient} = require("@prisma/client");
const {Readable, Transform} = require("stream");
const {google} = require('googleapis');
const get = require('lodash.get');
const fs = require("fs");
// const serviceAccount = require("./service-account.json");

const connection = new PrismaClient();
const sheets = google.sheets('v4');

const readableStreamFromTable = (table) => {
  let cursorId = undefined;
  const batchSize = 100;

  return new Readable({
    objectMode: true,
    async read() {
      try {
        const items = await connection[table].findMany({
          take: batchSize,
          skip: cursorId ? 1 : 0,
          cursor: cursorId ? {id: cursorId} : undefined,
        })
        if (items.length === 0) {
          this.push(null)
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

class JSONToCSVer extends Transform {
  _transform(chunk, encoding, callback) {
    const data = JSON.parse(chunk.toString());

    callback(null, Object.values(data).map(i => `"${i}"`).join(','))
  }
}

class NewLiner extends Transform {
  _transform(chunk, encoding, callback) {
    callback(null, chunk.toString() + "\n");
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

  console.log(auth)

  google.options({auth});

  // Delete all data in sheet
  await sheets.spreadsheets.values.batchClear({
    spreadsheetId: "19xDMEYA9DYRKeRndV0aH51YjL17pQjfGwFCvYkAxIWI",
    resource: {
      ranges: [],
    },
  });

  const writeStream = fs.createWriteStream('./output.csv');
  const workFlowsStream = readableStreamFromTable('workflow')
    .on('end', function () {
      workFlowsStream.destroy();
    });
  const workflowColumns = [
    'id',
    'type',
    'formId',
    'socialCareId',
    'createdBy',
    'createdAt',
    'answers.mock-step.mock-question',
  ];

  writeStream.write(Buffer.from(workflowColumns.map(i => `"${i}"`).join(',') + "\n"))

  workFlowsStream
    .pipe(new DataExtractor(workflowColumns))
    .pipe(new JSONToCSVer)
    .pipe(new NewLiner)
    .pipe(writeStream);


  return null;
};

getReportingData().then(() => console.log('done')).catch(e => console.log(e));
