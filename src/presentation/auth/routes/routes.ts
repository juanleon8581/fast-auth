import { Router } from "express";
import { AuthDatasource } from "@/infrastructure/external/auth/datasources/auth.datasource";
import { AuthClient } from "@/infrastructure/external/auth/auth.client";
import { AuthController } from "@/presentation/auth/controllers/auth.controller";
import { AuthMiddleware } from "@/presentation/middlewares/auth.middleware";
import { CryptoMiddleware } from "@/presentation/middlewares/crypto.middleware";

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();
    const datasource = new AuthDatasource(AuthClient);
    const controller = new AuthController(datasource);

    // Public routes
    router.get("/public-key", controller.getPublicKey);
    router.post(
      "/request-reset-password-email",
      controller.requestResetPasswordEmail,
    );

    // Crypto routes
    router.post("/register", CryptoMiddleware.decrypt, controller.register);
    router.post("/login", CryptoMiddleware.decrypt, controller.login);
    router.post(
      "/logout",
      CryptoMiddleware.decrypt,
      AuthMiddleware.verify,
      controller.logout,
    );
    router.put(
      "/update-user",
      CryptoMiddleware.decrypt,
      AuthMiddleware.verify,
      controller.updateUser,
    );
    router.put(
      "/update-user-password",
      CryptoMiddleware.decrypt,
      AuthMiddleware.verify,
      controller.updateUserPassword,
    );

    return router;
  }
}
