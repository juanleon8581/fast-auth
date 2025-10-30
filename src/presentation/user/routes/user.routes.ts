import { Router } from "express";
import { UserWebhookController } from "../controllers/user-webhook.controller";
import { UserDatasource } from "@/infrastructure/persistence/datasources/user.datasource";
import { SupabaseWebhookMiddleware } from "@/presentation/middlewares/supabase.webhook.middleware";

export class UserRoutes {
  static get routes(): Router {
    const router = Router();

    const datasource = new UserDatasource();
    const controller = new UserWebhookController(datasource);

    router.post(
      "/webhooks/auth",
      SupabaseWebhookMiddleware.handle,
      controller.handleAuthUserCreated,
    );

    return router;
  }
}
