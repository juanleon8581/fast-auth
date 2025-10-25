import { transports } from "winston";

describe("logger.service.test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  describe("LoggerService 🧾", () => {
    it("should create a logger instance", async () => {
      const LoggerService = (await import("../logger.service")).default;

      const loggerService = new LoggerService();
      expect(loggerService).toBeInstanceOf(LoggerService);
    });

    it("should call addColors when create a logger instance", () => {
      const winston = require("winston");
      const LoggerService = require("../logger.service").default;

      const addColorsSpy = jest.spyOn(winston, "addColors");

      const loggerService = new LoggerService();
      expect(loggerService).toBeInstanceOf(LoggerService);
      expect(addColorsSpy).toHaveBeenCalledWith(LoggerService._logColors);
    });

    it("should obtain the default transporters using the envs", () => {
      const LoggerService = require("../logger.service").default;
      const loggerService = new LoggerService();
      const transporters = loggerService._getTransporters();

      expect(transporters).toHaveLength(1);
      expect(transporters[0]).toBeInstanceOf(transports.Console);
    });

    it("should obtain the file transporters using the envs", () => {
      jest.mock("@/infrastructure/config/environment/envs", () => ({
        LOG_TRANSPORT: "file",
      }));
      const LoggerService = require("../logger.service").default;
      const loggerService = new LoggerService();
      const transporters = loggerService._getTransporters();

      expect(transporters).toHaveLength(1);
      expect(transporters[0]).toBeInstanceOf(transports.File);
    });

    it("should obtain the all transporters using the envs", () => {
      jest.mock("@/infrastructure/config/environment/envs", () => ({
        LOG_TRANSPORT: "all",
      }));
      const LoggerService = require("../logger.service").default;
      const loggerService = new LoggerService();
      const transporters = loggerService._getTransporters();

      expect(transporters).toHaveLength(2);
      expect(transporters[0]).toBeInstanceOf(transports.Console);
      expect(transporters[1]).toBeInstanceOf(transports.File);
    });

    it("should obtain the default log level using the envs", () => {
      const LoggerService = require("../logger.service").default;
      const loggerService = new LoggerService();
      const logLevel = loggerService._getLogLevel();

      expect(logLevel).toBe("error");
    });

    it("should obtain the DEV environment logLevel using the envs", () => {
      jest.mock("@/infrastructure/config/environment/envs", () => ({
        NODE_ENV: "dev",
      }));
      const LoggerService = require("../logger.service").default;
      const loggerService = new LoggerService();
      const logLevel = loggerService._getLogLevel();

      expect(logLevel).toBe("silly");
    });

    it("should obtain the QA environment logLevel using the envs", () => {
      jest.mock("@/infrastructure/config/environment/envs", () => ({
        NODE_ENV: "qa",
      }));
      const LoggerService = require("../logger.service").default;
      const loggerService = new LoggerService();
      const logLevel = loggerService._getLogLevel();

      expect(logLevel).toBe("http");
    });

    it("should obtain the PROD environment logLevel using the envs", () => {
      jest.mock("@/infrastructure/config/environment/envs", () => ({
        NODE_ENV: "prod",
      }));
      const LoggerService = require("../logger.service").default;
      const loggerService = new LoggerService();
      const logLevel = loggerService._getLogLevel();

      expect(logLevel).toBe("info");
    });

    it("should obtain format for logs", () => {
      const LoggerService = require("../logger.service").default;
      const loggerService = new LoggerService();
      const logFormat = loggerService._getLogFormat();

      expect(logFormat).toBeDefined();
    });

    it("should format logs as JSON", async () => {
      const format = (await import("winston")).format;
      const formatJsonSpy = jest.spyOn(format, "json");

      const LoggerService = require("../logger.service").default;
      const loggerService = new LoggerService();

      loggerService._getLogFormat();

      expect(loggerService).toBeDefined();
      expect(formatJsonSpy).toHaveBeenCalledTimes(1);
      expect(formatJsonSpy).toHaveBeenCalledWith();
    });

    it("should format logs whit timestamp", async () => {
      const format = (await import("winston")).format;
      const formatTimeStampSpy = jest.spyOn(format, "timestamp");

      const LoggerService = require("../logger.service").default;
      const loggerService = new LoggerService();

      loggerService._getLogFormat();

      expect(loggerService).toBeDefined();
      expect(formatTimeStampSpy).toHaveBeenCalledTimes(1);
      expect(formatTimeStampSpy).toHaveBeenCalledWith();
    });

    it("should format error logs with stack trace", async () => {
      const format = (await import("winston")).format;
      const formatErrorsSpy = jest.spyOn(format, "errors");

      const LoggerService = require("../logger.service").default;
      const loggerService = new LoggerService();

      loggerService._getLogFormat();

      expect(loggerService).toBeDefined();
      expect(formatErrorsSpy).toHaveBeenCalledTimes(1);
      expect(formatErrorsSpy).toHaveBeenCalledWith({
        stack: true,
      });
    });
  });
});
