import { z } from "zod";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test", "dev", "prod", "qa"])
    .default("development"),
  PORT: z.coerce.number().default(3000),

  // Supabase Configuration
  SUPABASE_URL: z.string().url({ message: "Must be a valid URL" }),
  SUPABASE_ANON_KEY: z.string(),
});

type IEnv = z.infer<typeof envSchema>;

const loadEnvironmentConfig = () => {
  // Get the current environment from NODE_ENV or default to 'dev'
  const currentEnv = process.env.NODE_ENV || "dev";

  // Normalize environment names
  const envMap: Record<string, string> = {
    development: "dev",
    production: "prod",
    qa: "qa",
    dev: "dev",
    prod: "prod",
  };

  const normalizedEnv = envMap[currentEnv] || "dev";

  // Load base .env file first
  config({ path: resolve(process.cwd(), ".env") });

  // Load environment-specific .env file if it exists
  const envFilePath = resolve(process.cwd(), `.env.${normalizedEnv}`);
  config({ path: envFilePath, override: true });

  console.log(`🔧 Loading environment configuration for: ${normalizedEnv}`);

  try {
    // Validate environment variables against the schema
    const validatedEnvs: IEnv = envSchema.parse(process.env);
    console.log(
      `✅ Environment variables validated successfully for ${normalizedEnv}`,
    );
    return validatedEnvs;
  } catch (error) {
    console.error(
      `❌ Invalid environment variables for ${normalizedEnv}:`,
      error,
    );
    throw new Error(
      `Failed to validate environment variables for ${normalizedEnv}`,
    );
  }
};

const envs = loadEnvironmentConfig();

export default envs;
