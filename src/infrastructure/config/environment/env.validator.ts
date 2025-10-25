import { TEnvironment } from "@/domain/shared/interfaces/environments.interfaces";
import { z } from "zod";

const environmentsArray: TEnvironment[] = ["dev", "prod", "qa"];

const envSchema = z.object({
  NODE_ENV: z.enum(environmentsArray, {
    message:
      "NODE_ENV must be one of the following: dev, prod, qa, development, production",
  }),
  PORT: z.coerce.number().default(3000),
  SUPABASE_URL: z.url({ message: "Must be a valid URL" }),
  SUPABASE_ANON_KEY: z
    .string({ message: "SUPABASE_ANON_KEY is required" })
    .nonempty("SUPABASE_ANON_KEY must be non-empty"),
  JWT_SECRET: z
    .string({ message: "JWT_SECRET is required" })
    .min(32, { message: "JWT_SECRET must be at least 32 characters long" }),
  DATABASE_URL: z.url({ message: "Must be a valid database URL" }),
  PASSPHRASE: z
    .string({ message: "PASSPHRASE is required" })
    .min(12, { message: "PASSPHRASE must be at least 12 characters long" }),
  LOG_TRANSPORT: z
    .enum(["console", "file", "all"], {
      message: "LOG_TRANSPORT must be one of the following: console, file, all",
    })
    .optional()
    .default("console"),
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"], {
      message:
        "LOG_LEVEL must be one of the following: error, warn, info, http, verbose, debug, silly",
    })
    .optional()
    .default("info"),
});

export type IEnv = z.infer<typeof envSchema>;

export class EnvValidator {
  static validate(data: Record<string, string | undefined>): IEnv {
    try {
      const validatedData: IEnv = envSchema.parse(data);

      console.log(
        `✅ Environment variables validated successfully for ${validatedData.NODE_ENV}`,
      );
      return validatedData;
    } catch (error) {
      console.error(
        `❌ Invalid environment variables for ${process.env.NODE_ENV}`,
        error,
      );
      throw error;
    }
  }
}
