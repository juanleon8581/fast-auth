import { Router } from "express";
import { AuthRoutes } from "./auth/routes/routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    // Health check route
    router.get("/", (req, res) => {
      res.json({ message: "API is running", version: "1.0.0" });
    });

    // Example feature routes
    // router.use("/users", UserRoutes.routes);
    router.use("/auth", AuthRoutes.routes);

    return router;
  }
}
