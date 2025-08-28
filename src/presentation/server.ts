import express, { Router } from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "@/config/docs/swagger";

interface IOptions {
  port: number;
  routes: Router;
}

export class Server {
  private readonly app = express();
  private readonly port: number;
  private readonly router: Router;

  constructor(options: IOptions) {
    this.port = options.port;
    this.router = options.routes;
  }

  async start() {
    // Security middlewares
    this.app.use(helmet());
    this.app.use(cors());

    // Body parsing middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Swagger documentation
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res
        .status(200)
        .json({ status: "OK", timestamp: new Date().toISOString() });
    });

    // API Routes
    this.app.use("/api", this.router);

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({ error: "Route not found" });
    });

    // Start server
    this.app.listen(this.port, () => {
      console.log(`🚀 Server is running on http://localhost:${this.port}`);
    });
  }
}
