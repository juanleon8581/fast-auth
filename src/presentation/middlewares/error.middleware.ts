import { Request, Response } from "express";
import { ErrorHandler } from "@/domain/errors/error-handler";

export class ErrorMiddleware {
  static handleError(
    error: unknown,
    req: Request,
    res: Response
  ): void {
    const errorResponse = ErrorHandler.handle(
      error,
      req.requestId,
      "1.0.0"
    );
    res.status(errorResponse.code).json(errorResponse);
  }
}
