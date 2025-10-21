import { z } from "zod";
import { config } from "dotenv";
import { resolve } from "path";
import { TEnvironment } from "@/domain/shared/interfaces/environments.interfaces";

// Load environment variables
config();

const environmentsArray: TEnvironment[] = [
  "dev",
  "prod",
  "qa",
  "development",
  "production",
];

const envSchema = z.object({
  // Accept common and shorthand environment names
  NODE_ENV: z.enum(environmentsArray).default("dev"),
  PORT: z.coerce.number().default(3000),

  // Supabase Configuration
  SUPABASE_URL: z.url({ message: "Must be a valid URL" }),
  SUPABASE_ANON_KEY: z.string(),

  // Optional in tests/dev; validated when present
  JWT_SECRET: z
    .string()
    .min(32, { message: "JWT_SECRET must be at least 32 characters long" })
    .optional(),

  // Optional; validate format when provided
  DATABASE_URL: z
    .string()
    .url({ message: "Must be a valid database URL" })
    .optional(),

  // Private Key for RSA-OAEP
  PASSPHRASE: z
    .string()
    .min(12, { message: "PASSPHRASE must be at least 12 characters long" }),
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
