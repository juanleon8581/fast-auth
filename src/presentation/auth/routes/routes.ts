import { Router } from "express";
import { AuthDatasource } from "@/infrastructure/datasources/auth.datasource";
import { AuthClient } from "@/infrastructure/config/auth.client";
import { AuthController } from "@/presentation/controller/controller";

export class AuthRoutes {
  static get routes(): Router {
    const router = Router();
    const datasource = new AuthDatasource(AuthClient);
    const controller = new AuthController(datasource);

    router.post("/register", controller.register);

    return router;
  }
}
