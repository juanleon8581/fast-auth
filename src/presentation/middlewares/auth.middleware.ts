import { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { TextEncoder } from "util";
import envs from "../../config/envs";
import { LogDatasource } from "@/infrastructure/datasources/log.datasource";
import { UnauthorizedError } from "@/domain/errors/unauthorized-error";
import { ERRORS } from "@/config/strings/global.strings.json";
import { ILogData } from "@/domain/interfaces/log.interfaces";
import { CreateLogDto } from "@/domain/dtos/create-log.dto";
import { CreateLog } from "@/domain/use-cases/create-log";

/**
 * Authentication middleware that validates JWT Bearer tokens
 * Implemented as a class with static methods to align with project standards
 */
export class AuthMiddleware {
  private static logDatasource = LogDatasource.getInstance();

  static logAuth(req: Request, res: Response) {
    const logData: ILogData = {
      level: "INFO",
      message: "Authorization header verified",
      timestamp: new Date(),
      meta: {
        method: req.method,
        url: req.url,
        userAgent: req.get("User-Agent")?.substring(0, 100),
        ip: req.ip,
        resCode: res.statusCode,
        endpoint: req.path,
      },
      service: "auth-middleware",
      requestId: req.requestId,
    };

    const [dtoError, createLogDto] = CreateLogDto.createFrom(logData);

    if (dtoError) return Promise.resolve(false);

    return new CreateLog(AuthMiddleware.logDatasource)
      .execute(createLogDto!)
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Verifies the presence and integrity of a JWT Bearer token
   */
  static async verify(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Extract Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        next(
          new UnauthorizedError(
            ERRORS.DATA_VALIDATION.AUTHORIZATION_HEADER_REQUIRED,
            "authorization",
            "MISSING_AUTH_HEADER",
          ),
        );
        return;
      }

      // Check if it's a Bearer token
      if (!authHeader.startsWith("Bearer ")) {
        next(
          new UnauthorizedError(
            'Authorization header must start with "Bearer "',
            "authorization",
            "INVALID_AUTH_FORMAT",
          ),
        );
        return;
      }

      // Extract the token
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      if (!token) {
        next(
          new UnauthorizedError(
            "Bearer token cannot be empty",
            "token",
            "MISSING_TOKEN",
          ),
        );
        return;
      }

      // Verify the JWT token using jose
      const secret = new TextEncoder().encode(envs.JWT_SECRET);

      try {
        await jwtVerify(token, secret, {
          algorithms: ["HS256"], // Supabase uses HS256 for symmetric keys
        });

        // Log successful authentication
        AuthMiddleware.logAuth(req, res).catch((logError) => {
          console.error("Failed to log auth:", logError);
        });

        // Continue to the next middleware/route handler
        next();
      } catch (jwtError) {
        // Handle JWT verification errors
        if (jwtError instanceof Error) {
          if (jwtError.message.includes("expired")) {
            next(
              new UnauthorizedError(
                ERRORS.DATA_VALIDATION.TOKEN_EXPIRED,
                "token",
                "TOKEN_EXPIRED",
              ),
            );
            return;
          }

          if (jwtError.message.includes("signature")) {
            next(
              new UnauthorizedError(
                "Invalid token signature",
                "token",
                "INVALID_SIGNATURE",
              ),
            );
            return;
          }
        }
        next(
          new UnauthorizedError(
            "Invalid or malformed token",
            "token",
            "INVALID_TOKEN",
          ),
        );
        return;
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("Auth middleware error:", error);
      next(error);
      return;
    }
  }

  /**
   * Optional auth: proceeds if no token, otherwise performs verification
   */
  static async optionalVerify(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const authHeader = req.headers.authorization;

    // If no auth header, continue without validation
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next();
      return;
    }

    // If auth header exists, validate it using the main verifier
    await AuthMiddleware.verify(req, res, next);
  }
}
