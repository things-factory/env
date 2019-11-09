var config = require("./config");
var { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");

const { printf } = format;

var { file: fileConfig, console: consoleConfig } = config.get("logger", {});

var transports = [];

if (fileConfig) {
  const FILE_LOGGER_CONFIG = {
    filename: "logs/application-%DATE%.log",
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level: "info"
  };

  transports.push(
    new winston.transports.DailyRotateFile(
      Object.assign({}, FILE_LOGGER_CONFIG, loggerConfig)
    )
  );
}

if (consoleConfig) {
  const CONSOLE_LOGGER_CONFIG = { level: "silly" };

  transports.push(
    new winston.transports.Console(
      Object.assign({}, CONSOLE_LOGGER_CONFIG, fileConfig)
    )
  );
}

const format = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

module.exports = createLogger({
  format,
  transports
});
