import { Router } from "express";
import { AuthDatasource } from "@/infrastructure/datasources/auth.datasource";
import { AuthClient } from "@/infrastructure/config/auth.client";
import { AuthController } from "@/presentation/controller/controller";
import { authMiddleware } from "@/presentation/middlewares/auth.middleware";

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();
    const datasource = new AuthDatasource(AuthClient);
    const controller = new AuthController(datasource);

    router.post("/register", controller.register);
    router.post("/login", controller.login);
    router.post("/logout", authMiddleware, controller.logout);
    router.put("/update-user", authMiddleware, controller.updateUser);
    router.put(
      "/update-user-password",
      authMiddleware,
      controller.updateUserPassword,
    );
    router.post(
      "/request-reset-password-email",
      controller.requestResetPasswordEmail,
    );

    return router;
  }
}
