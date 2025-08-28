import express, { Router, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import getSwaggerSpec from "@/config/docs/swagger";
import { ErrorMiddleware } from "./middlewares/error.middleware";
import { NotFoundError } from "@/domain/errors/not-found-error";

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

    // Swagger documentation with HMR support
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      (req: Request, res: Response, next: NextFunction) => {
        // Regenerate swagger spec on each request in development
        const swaggerSpec = getSwaggerSpec();
        swaggerUi.setup(swaggerSpec)(req, res, next);
      }
    );

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res
        .status(200)
        .json({ status: "OK", timestamp: new Date().toISOString() });
    });

    // API Routes
    this.app.use("/api", this.router);

    // Error handling middleware
    this.app.use(ErrorMiddleware.handleError);

    // 404 handler
    this.app.use("*", (req, res, next) => {
      next(new NotFoundError("Route not found"));
    });

    // Start server
    this.app.listen(this.port, () => {
      console.log(`🚀 Server is running on http://localhost:${this.port}`);
      console.log(
        `📑 documentation available at http://localhost:${this.port}/api-docs`
      );
    });
  }
}
