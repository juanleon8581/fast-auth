import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "@/domain/errors/error-handler";

export class ErrorMiddleware {
  static handleError(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const errorResponse = ErrorHandler.handle(error);
    res.status(errorResponse.code).json(errorResponse);
  }
}
