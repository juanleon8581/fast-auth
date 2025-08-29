import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "@/domain/errors/error-handler";

export class ErrorMiddleware {
  static handleError(
    error: unknown,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
  ): void {
    const errorResponse = ErrorHandler.handle(
      error,
      req.requestId,
      "1.0.0"
    );
    res.status(errorResponse.code).json(errorResponse);
  }
}
