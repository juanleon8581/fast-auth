import { createLogger, format, transports, addColors } from "winston";
import type { Logger } from "winston";
import envs from "../../config/environment/envs";
import type {
  TLogLevels,
  TLogTransport,
} from "@/domain/shared/interfaces/logger.interfaces";

const logLevels: Record<TLogLevels, number> = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

const logColors: Record<TLogLevels, string> = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  verbose: "cyan",
  debug: "blue",
  silly: "gray",
};

const logTransports: Record<
  TLogTransport,
  (transports.ConsoleTransportInstance | transports.FileTransportInstance)[]
> = {
  console: [new transports.Console()],
  file: [
    new transports.File({
      filename: "logs/combined.log",
    }),
  ],
  all: [
    new transports.Console(),
    new transports.File({
      filename: "logs/combined.log",
    }),
  ],
};

class LoggerService {
  private _logger: Logger;
  private static _logLevels = logLevels;
  private static _logColors = logColors;

  constructor() {
    this._logger = createLogger({
      levels: LoggerService._logLevels,
      level: this._getLogLevel(),
      transports: this._getTransporters(),
      exceptionHandlers: [new transports.File({ filename: "exception.log" })],
      rejectionHandlers: [new transports.File({ filename: "rejections.log" })],
    });
    addColors(LoggerService._logColors);
  }

  get logger() {
    return this._logger;
  }

  private _getLogLevel(): TLogLevels {
    const envLogLevel = envs.NODE_ENV;

    if (envLogLevel === "dev") {
      return "silly";
    }
    if (envLogLevel === "prod") {
      return "info";
    }
    if (envLogLevel === "qa") {
      return "http";
    }

    return "error";
  }

  private _getTransporters() {
    const logTransport = envs.LOG_TRANSPORT;
    return logTransports[logTransport];
  }

  private _getLogFormat() {
    return format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json(),
    );
  }
}

export default LoggerService;
