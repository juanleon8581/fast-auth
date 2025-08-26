import { z } from "zod";
import { config } from "dotenv";

// Load environment variables
config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
});

type IEnv = z.infer<typeof envSchema>;

const loadEnvironmentConfig = (): IEnv => {
  try {
    const envs = envSchema.parse(process.env);
    return envs;
  } catch (error) {
    console.error("❌ Environment validation failed:");
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    process.exit(1);
  }
};

const envs = loadEnvironmentConfig();

export default envs;