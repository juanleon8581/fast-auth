import { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { TextEncoder } from "util";
import envs from "../../config/envs";

/**
 * Authentication middleware that validates JWT Bearer tokens
 * Implemented as a class with static methods to align with project standards
 */
export class AuthMiddleware {
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
        res.status(401).json({
          error: "Authorization header is required",
          message: "Please provide a valid Bearer token",
        });
        return;
      }

      // Check if it's a Bearer token
      if (!authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          error: "Invalid authorization format",
          message: 'Authorization header must start with "Bearer "',
        });
        return;
      }

      // Extract the token
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      if (!token) {
        res.status(401).json({
          error: "Token is required",
          message: "Bearer token cannot be empty",
        });
        return;
      }

      // Verify the JWT token using jose
      const secret = new TextEncoder().encode(envs.JWT_SECRET);

      try {
        await jwtVerify(token, secret, {
          algorithms: ["HS256"], // Supabase uses HS256 for symmetric keys
        });

        // Continue to the next middleware/route handler
        next();
      } catch (jwtError) {
        // Handle JWT verification errors
        if (jwtError instanceof Error) {
          if (jwtError.message.includes("expired")) {
            res.status(401).json({
              error: "Token expired",
              message:
                "The provided token has expired. Please refresh your token.",
            });
            return;
          }

          if (jwtError.message.includes("signature")) {
            res.status(401).json({
              error: "Invalid token signature",
              message: "The token signature is invalid",
            });
            return;
          }
        }

        res.status(401).json({
          error: "Invalid token",
          message: "The provided token is invalid or malformed",
        });
        return;
      }
    } catch (error) {
      // Handle unexpected errors
      console.error("Auth middleware error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "An unexpected error occurred during authentication",
      });
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
