import winston from "winston";
import envs from "./envs";

// Define log levels matching our domain interfaces
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

// Define colors for console output
const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  verbose: "cyan",
  debug: "blue",
  silly: "gray",
};

// Add colors to winston
winston.addColors(logColors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    ({
      timestamp,
      level,
      message,
      service,
      userId,
      requestId,
      error,
      ...meta
    }) => {
      let logMessage = `${timestamp} [${level}]`;

      if (service) logMessage += ` [${service}]`;
      if (requestId) logMessage += ` [${requestId}]`;
      if (userId) logMessage += ` [User: ${userId}]`;

      logMessage += `: ${message}`;

      if (error) logMessage += ` | Error: ${error}`;
      if (Object.keys(meta).length > 0) {
        logMessage += ` | Meta: ${JSON.stringify(meta)}`;
      }

      return logMessage;
    },
  ),
);

// Create transports array
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
    level: envs.NODE_ENV === "production" ? "info" : "debug",
  }),
];

// Add file transport for production
if (envs.NODE_ENV === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  );
}

// Create winston logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: envs.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports,
  exitOnError: false,
});

// Handle uncaught exceptions and unhandled rejections
if (envs.NODE_ENV === "production") {
  logger.exceptions.handle(
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  );

  logger.rejections.handle(
    new winston.transports.File({ filename: "logs/rejections.log" }),
  );
}

export default logger;
