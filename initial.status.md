Se debe crear un proyecto base de express con la siguiente estructura de file system.
Es importante iniciar de con la cantidad minima de dependencias y asumiendo lo menos posible, no agregues información innecesaria como variables de entorno no estandarizadas o dependencias especificas por que crees que se deben usar. inicia con lo básico a no ser que mas adelante en este documento se especifiquen

En este documento te especifico el contenido de algunos archivos, para los que no especifique, constuye una version sobria y minimalista que cumpla con lo esperado para un API REST de express, esto con archivos como gitignore, tsconfig, readme, .env.example y otros archivos necesarios para un proyecto de express.

La estructura de carpetas debe ser la siguiente:

```
├── .env.example                    # Template de variables de entorno con configuraciones por defecto
├── .gitignore                      # Archivos y carpetas a ignorar por Git
├── package.json                    # Dependencias, scripts y metadatos del proyecto
├── tsconfig.json                   # Configuración de TypeScript
├── README.md                       # Documentación del proyecto
├── Dockerfile                      # Configuración para containerización
├── docker-compose.yml              # Orquestación de contenedores
└── src/
    ├── app.ts                      # Punto de entrada principal de la aplicación
    ├── config/
    │   ├── envs.ts                 # Validación y carga de variables de entorno con Zod
    │   ├── strings/                # Constantes de strings reutilizables
    │   └── regex/                  # Expresiones regulares comunes
    ├── domain/                     # Capa de dominio (Clean Architecture)
    │   ├── dtos/                   # Data Transfer Objects
    │   ├── entities/               # Entidades de dominio
    │   ├── interfaces/             # Contratos e interfaces
    │   ├── repositories/           # Interfaces de repositorios
    │   └── use-cases/              # Casos de uso de la aplicación
    ├── infrastructure/             # Capa de infraestructura
    │   ├── config/                 # Configuraciones de infraestructura
    │   ├── datasources/            # Implementaciones de acceso a datos
    │   └── validators/             # Validadores de entrada
    └── presentation/               # Capa de presentación
        ├── server.ts               # Configuración del servidor Express
        ├── routes.ts               # Enrutador principal de la aplicación
        └── [feature]/              # Carpetas por funcionalidad (ej: auth/)
            └── routes/             # Rutas específicas de cada feature
```

El package.json inicial debe lucir de esta manera

```
{
  "name": "fast auth",
  "version": "1.0.0",
  "description": "Api de Autenticación",
  "main": "dist/app.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only --ignore-watch node_modules -r tsconfig-paths/register src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts"
  },
  "keywords": [
    "express",
    "typescript",
    "api",
    "template"
  ],
  "author": "Tu Nombre",
  "license": "MIT",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/cors": "^2.8.16",
    "@types/express": "^4.17.20",
    "@types/jest": "^29.5.7",
    "@types/node": "^20.8.7",
    "@types/supertest": "^2.0.16",
    "eslint": "^8.52.0",
    "@typescript-eslint/eslint-plugin": "^6.9.0",
    "@typescript-eslint/parser": "^6.9.0",
    "jest": "^29.7.0",
    "prettier": "^3.0.3",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.1",
    "ts-node-dev": "^2.0.0",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.2.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

Aca hay templates base de archivos principales

## app.ts - Punto de entrada principal

```
import envs from "./config/envs";
import { Server } from "./presentation/
server";
import { AppRoutes } from "./presentation/
routes";

(async () => {
  main();
})();

function main() {
  const server = new Server({
    port: envs.PORT,
    routes: AppRoutes.routes,
  });

  server.start();
}
```

## server.ts - Configuración del servidor Express

```
import express, { Router } from "express";
import cors from "cors";
import helmet from "helmet";

interface IOptions {
  port: number;
  routes: Router;
}

export class Server {
  private readonly app = express();
  private readonly port: number;
  private readonly router: Router;

  constructor(options: IOptions) {
    this.port = options.port;
    this.router = options.routes;
  }

  async start() {
    // Security middlewares
    this.app.use(helmet());
    this.app.use(cors());

    // Body parsing middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ 
    extended: true }));

    // Health check endpoint
    this.app.get("/health", (req, res) => 
    {
      res.status(200).json({ status: 
      "OK", timestamp: new Date().
      toISOString() });
    });

    // API Routes
    this.app.use("/api", this.router);

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({ error: 
      "Route not found" });
    });

    // Start server
    this.app.listen(this.port, () => {
      console.log(`🚀 Server is running 
      on http://localhost:${this.port}`);
    });
  }
}
```

## routes.ts - Enrutador principal

```
import { Router } from "express";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();

    // Health check route
    router.get("/", (req, res) => {
      res.json({ message: "API is 
      running", version: "1.0.0" });
    });

    // Example feature routes
    // router.use("/users", UserRoutes.
    routes);
    // router.use("/auth", AuthRoutes.
    routes);

    return router;
  }
}
```

## config/envs.ts - Configuración de variables de entorno

```
import { z } from "zod";
import { config } from "dotenv";

// Load environment variables
config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", 
  "production", "test"]).default
  ("development"),
  PORT: z.coerce.number().default(3000),
});

type IEnv = z.infer<typeof envSchema>;

const loadEnvironmentConfig = (): IEnv => 
{
  try {
    const envs = envSchema.parse(process.
    env);
    return envs;
  } catch (error) {
    console.error("❌ Environment 
    validation failed:");
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join
        (".")}: ${err.message}`);
      });
    }
    process.exit(1);
  }
};

const envs = loadEnvironmentConfig();

export default envs;
```
