const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const expressWinston = require('express-winston');

const logger = require('../logger');
const config = require('../config');
const handleQuery = require('./query');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

expressWinston.requestWhitelist.push('body');
expressWinston.responseWhitelist.push('body');
app.use(expressWinston.logger({
  meta: true, // optional: log meta data about request (defaults to true)
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  colorStatus: true, // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
  winstonInstance: logger,
}));

app.use(expressWinston.errorLogger({
  winstonInstance: logger
}));

app.get('/query', handleQuery);

module.exports = app;
