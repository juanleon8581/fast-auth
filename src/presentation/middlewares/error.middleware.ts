import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "@/domain/errors/error-handler";
import LoggerService from "@/infrastructure/services/logger/logger.service";

export class ErrorMiddleware {
  private static readonly serviceNameForLogger = "error-middleware";
  static handleError(
    error: unknown,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
  ): void {
    const loggerService = new LoggerService().logger;
    const errorResponse = ErrorHandler.handle(error, req.requestId, "1.0.0");
    res.status(errorResponse.code).json(errorResponse);

    const logData = {
      error,
      req,
      res,
      service: ErrorMiddleware.serviceNameForLogger,
    };

    if (errorResponse.code < 500) {
      loggerService.warn(logData);
      return;
    }
    loggerService.error(logData);
  }
}
