const server = require('restana')();
const app = require('next')({dev: false});
const files = require('serve-static');
const path = require('path');
const bodyParser = require('body-parser');
const nextRequestHandler = app.getRequestHandler();

server.use(files(path.join(__dirname, 'build')));

server.all(
    '/api/*',
    bodyParser.json(),
    bodyParser.urlencoded(),
    (req, res) => nextRequestHandler(req, res),
);

server.all('*', (req, res) => nextRequestHandler(req, res));

module.exports.handler = require('serverless-http')(server);
