import { TEnvironment } from "@/domain/shared/interfaces/environments.interfaces";
import { z } from "zod";
import { ERROR_MESSAGES } from "./envs.constants";

const environmentsArray: TEnvironment[] = ["dev", "prod", "qa"];

const envSchema = z.object({
  NODE_ENV: z.enum(environmentsArray, {
    message: ERROR_MESSAGES.NODE_ENV.INVALID_VALUE,
  }),
  PORT: z.coerce.number().default(3000),
  SUPABASE_URL: z.url({ message: ERROR_MESSAGES.URLS }),
  SUPABASE_ANON_KEY: z
    .string({ message: ERROR_MESSAGES.SUPABASE_ANON_KEY.REQUIRED })
    .nonempty(ERROR_MESSAGES.SUPABASE_ANON_KEY.NON_EMPTY),
  JWT_SECRET: z
    .string({ message: ERROR_MESSAGES.JWT_SECRET.REQUIRED })
    .min(32, { message: ERROR_MESSAGES.JWT_SECRET.MIN_LENGTH }),
  DATABASE_URL: z.url({ message: ERROR_MESSAGES.URLS }),
  PASSPHRASE: z
    .string({ message: ERROR_MESSAGES.PASSPHASE.REQUIRED })
    .min(12, { message: ERROR_MESSAGES.PASSPHASE.MIN_LENGTH }),
  LOG_TRANSPORT: z
    .enum(["console", "file", "all"], {
      message: ERROR_MESSAGES.LOG_TRANSPORT.INVALID_VALUE,
    })
    .optional()
    .default("console"),
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"], {
      message: ERROR_MESSAGES.LOG_LEVEL.INVALID_VALUE,
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
