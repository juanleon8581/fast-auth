import { UnauthorizedError } from "@/domain/errors/unauthorized-error";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";
import { Request, Response, NextFunction } from "express";

export class SupabaseWebhookMiddleware {
  static handle(req: Request, res: Response, next: NextFunction) {
    try {
      const { "user-agent": userAgent, "content-type": contentType } =
        req.headers;

      if (!userAgent || !contentType) {
        return next(
          new UnauthorizedError(ERROR_MESSAGES.REQ_SIGN.UNKNOWN_ERROR),
        );
      }

      if (!userAgent.includes("pg_net") || contentType !== "application/json") {
        return next(
          new UnauthorizedError(ERROR_MESSAGES.REQ_SIGN.BAD_SIGNATURE),
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}
