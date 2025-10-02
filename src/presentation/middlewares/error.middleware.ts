import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "@/domain/errors/error-handler";
import { LogDatasource } from "@/infrastructure/datasources/log.datasource";
import { CreateLog } from "@/domain/use-cases/create-log";
import { CreateLogDto } from "@/domain/dtos/create-log.dto";
import { ILogData } from "@/domain/interfaces/log.interfaces";
import { TypeGuardsUtils } from "@/utils/type-guards.utils";

export class ErrorMiddleware {
  private static logDatasource = LogDatasource.getInstance();

  private static logError(error: unknown, req: Request): Promise<boolean> {
    try {
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
        service: "error-middleware",
        requestId: req.requestId,
      };

      const [dtoError, createLogDto] = CreateLogDto.createFrom(logData);

      if (dtoError) return Promise.resolve(false);

      return new CreateLog(ErrorMiddleware.logDatasource)
        .execute(createLogDto!)
        .then(() => true)
        .catch(() => false);
    } catch (logError) {
      console.error("Critical: Failed to log error", {
        originalError: error,
        logError,
        requestId: req.requestId,
      });
      return Promise.resolve(false);
    }
  }

  static handleError(
    error: unknown,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
  ): void {
    const errorResponse = ErrorHandler.handle(error, req.requestId, "1.0.0");
    res.status(errorResponse.code).json(errorResponse);

    ErrorMiddleware.logError(error, req).catch((logError) => {
      console.error("Failed to log error:", logError);
    });
  }
}
