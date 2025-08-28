import swaggerJsdoc from "swagger-jsdoc";
import { version, name } from "@/../package.json";

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
  apis: ["./src/**/*.docs.yml"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
