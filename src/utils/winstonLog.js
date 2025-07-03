const winston = require('winston');
// Define log file location and format
const logFile = 'GptLogger.log';
const winstonLog = winston.createLogger({
  level: 'info', // Log level (e.g., info, error)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    //new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: logFile }) // Log to a file
  ],
});
module.exports = winstonLog;