import { LogDatasource } from "../datasources/log.datasource";
import { TypeGuardsUtils } from "@/utils/type-guards.utils";
import { CreateLogDto } from "@/domain/log/dtos/create-log.dto";
import { CreateLog } from "@/domain/use-cases/create-log";
import { ILogData, PROD_LOG_LEVELS } from "@/domain/interfaces/log.interfaces";
import envs from "@/config/envs";
import {
  IErrorlogData,
  IGenericLog,
  IInfoLogData,
} from "./logger.service.interfaces";

export class LoggerService {
  private static logDatasource = LogDatasource.getInstance();

  private static executeLog(logData: ILogData) {
    try {
      if (envs.NODE_ENV === "prod" && !PROD_LOG_LEVELS.includes(logData.level))
        return;

      const [dtoError, createLogDto] = CreateLogDto.createFrom(logData);

      if (dtoError) throw dtoError;

      new CreateLog(LoggerService.logDatasource)
        .execute(createLogDto!)
        .catch((error) => {
          throw error;
        });
    } catch (error) {
      console.error("Critical: Failed to log error", {
        originalError: error,
        requestId: logData.requestId,
      });
    }
  }

  private static generateLogData(logData: IGenericLog): ILogData {
    const { level, req, res, service, message, error, meta } = logData;
    const log: ILogData = {
      level,
      message: TypeGuardsUtils.truncateStringByKB(message ?? "", 1),
      timestamp: new Date(),
      meta: {
        method: req.method,
        endpoint: req.path,
        url: req.url,
        userAgent: req.get?.("User-Agent")?.substring(0, 100),
        ip: req.ip,
        httpVersion: req.httpVersion,
      },
      service: service,
      requestId: req.requestId,
    };

    if (meta) log.meta = { ...log.meta, ...meta };
    if (res) log.meta = { ...log.meta, statusCode: res.statusCode };
    if (error) log.error = TypeGuardsUtils.getAllErrorToString(error);

    return log;
  }

  static logError({ error, req, res, service }: IErrorlogData) {
    const logData: ILogData = LoggerService.generateLogData({
      level: "ERROR",
      req,
      res,
      service,
      message: TypeGuardsUtils.getErrorMessage(error),
      error,
    });

    LoggerService.executeLog(logData);
  }
  static logWarn({ error, req, res, service }: IErrorlogData) {
    const logData: ILogData = LoggerService.generateLogData({
      level: "WARN",
      req,
      res,
      service,
      message: TypeGuardsUtils.getErrorMessage(error),
      error,
    });

    LoggerService.executeLog(logData);
  }

  static logDebug({ message, req, res, service, meta }: IInfoLogData) {
    const data: IGenericLog = {
      level: "DEBUG",
      req,
      service,
      message,
    };
    if (meta) data.meta = meta;
    if (res) data.res = res;
    const logData: ILogData = LoggerService.generateLogData(data);

    LoggerService.executeLog(logData);
  }

  static logInfo({ message, req, res, service }: IInfoLogData) {
    const data: IGenericLog = {
      level: "INFO",
      req,
      service,
      message,
    };
    if (res) data.res = res;
    const logData: ILogData = LoggerService.generateLogData(data);

    LoggerService.executeLog(logData);
  }
}
