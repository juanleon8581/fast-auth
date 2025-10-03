import { Request } from "express";
import { LogDatasource } from "../datasources/log.datasource";
import { TypeGuardsUtils } from "@/utils/type-guards.utils";
import { CreateLogDto } from "@/domain/dtos/create-log.dto";
import { CreateLog } from "@/domain/use-cases/create-log";
import { ILogData } from "@/domain/interfaces/log.interfaces";

export class LoggerService {
  private static logDatasource = LogDatasource.getInstance();

  private static executeLog(logData: ILogData) {
    try {
      const [dtoError, createLogDto] = CreateLogDto.createFrom(logData);

      if (dtoError) throw dtoError;

      new CreateLog(LoggerService.logDatasource)
        .execute(createLogDto!)
        .catch((error) => {
          console.error("Failed to log error:", error);
        });
    } catch (error) {
      console.error("Critical: Failed to log error", {
        originalError: error,
        requestId: logData.requestId,
      });
    }
  }

  static logError({
    error,
    req,
    service,
  }: {
    error: unknown;
    req: Request;
    service: string;
  }) {
    const logData: ILogData = {
      level: "ERROR",
      message: TypeGuardsUtils.getErrorMessage(error),
      error: TypeGuardsUtils.getAllErrorToString(error),
      timestamp: new Date(),
      meta: {
        method: req.method,
        url: req.url,
        userAgent: req.get("User-Agent")?.substring(0, 100),
        ip: req.ip,
        endpoint: req.path,
      },
      service: service,
      requestId: req.requestId,
    };

    LoggerService.executeLog(logData);
  }

  static logInfo({
    message,
    req,
    service,
  }: {
    message: string;
    req: Request;
    service: string;
  }) {
    const logData: ILogData = {
      level: "INFO",
      message: message,
      timestamp: new Date(),
      meta: {
        method: req.method,
        url: req.url,
        userAgent: req.get("User-Agent")?.substring(0, 100),
        ip: req.ip,
        endpoint: req.path,
      },
      service: service,
      requestId: req.requestId,
    };

    LoggerService.executeLog(logData);
  }
}
