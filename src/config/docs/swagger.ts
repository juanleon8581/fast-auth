import swaggerJsdoc from "swagger-jsdoc";
import { version, name } from "@/../package.json";
import fs from "fs";
import path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: name,
      version: version,
      description: `API documentation for ${name}`,
      contact: {
        name: "Juan Pablo Leon Maya",
        url: "https://juanpabloleonmaya.is-a.dev/es",
        email: "juanpabloleonmaya.dev@gmail.com",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Local server",
        },
      ],
    },
  },
  apis: ["./src/config/docs/**/*.yml"],
};

// Función para generar la especificación de Swagger
const generateSwaggerSpec = () => {
  return swaggerJsdoc(options);
};

// Cache para la especificación
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedSpec: any = null;
let lastModified = 0;

// Función para verificar si los archivos YAML han cambiado
const checkForChanges = () => {
  const docsPath = path.join(process.cwd(), "src/config/docs");
  let latestModified = 0;

  const checkDirectory = (dir: string) => {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        checkDirectory(filePath);
      } else if (file.endsWith(".yml") || file.endsWith(".yaml")) {
        if (stat.mtime.getTime() > latestModified) {
          latestModified = stat.mtime.getTime();
        }
      }
    });
  };

  checkDirectory(docsPath);
  return latestModified;
};

// Función para obtener la especificación con cache inteligente
const getSwaggerSpec = () => {
  const currentModified = checkForChanges();

  if (!cachedSpec || currentModified > lastModified) {
    console.log("🔄 Regenerating Swagger documentation...");
    cachedSpec = generateSwaggerSpec();
    lastModified = currentModified;
  }

  return cachedSpec;
};

export default getSwaggerSpec;
export { generateSwaggerSpec };
