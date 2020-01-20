var config = require('./config')
var { createLogger, format, transports } = require('winston')
require('winston-daily-rotate-file')

const { combine, timestamp, splat, simple, printf } = format

var { file: fileConfig, console: consoleConfig } = config.get('logger', {})

var logTransports = []

if (fileConfig) {
  const FILE_LOGGER_CONFIG = {
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info'
  }

  logTransports.push(new transports.DailyRotateFile(Object.assign({}, FILE_LOGGER_CONFIG, fileConfig)))
}

if (consoleConfig) {
  const CONSOLE_LOGGER_CONFIG = { level: 'silly' }

  logTransports.push(new transports.Console(Object.assign({}, CONSOLE_LOGGER_CONFIG, consoleConfig)))
}

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

module.exports = createLogger({
  format: combine(timestamp(), splat(), logFormat),
  transports: logTransports
})
