import { Router } from "express";
import { AuthDatasource } from "@/infrastructure/datasources/auth.datasource";
import { AuthClient } from "@/infrastructure/config/auth.client";
import { AuthController } from "@/presentation/controller/controller";
import { AuthMiddleware } from "@/presentation/middlewares/auth.middleware";

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();
    const datasource = new AuthDatasource(AuthClient);
    const controller = new AuthController(datasource);

    // Protected routes
    router.post("/register", controller.register);
    router.post("/login", controller.login);
    router.post("/logout", AuthMiddleware.verify, controller.logout);
    router.put("/update-user", AuthMiddleware.verify, controller.updateUser);
    router.put(
      "/update-user-password",
      AuthMiddleware.verify,
      controller.updateUserPassword,
    );

    // Public routes
    router.post(
      "/request-reset-password-email",
      controller.requestResetPasswordEmail,
    );

    return router;
  }
}
