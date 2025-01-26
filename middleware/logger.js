const  {format } = require('date-fns');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

const logEvents = (message) => {
  try {
    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
    const logItem = `${dateTime}\t${uuidv4()}\t${message}\n`;
    console.log(logItem);
  } catch (error) {
    console.error(error);
  }
}

const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`);
  next();
}

module.exports = { logger, logEvents };
