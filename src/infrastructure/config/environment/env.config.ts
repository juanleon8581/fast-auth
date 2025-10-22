import { TEnvironment } from "@/domain/shared/interfaces/environments.interfaces";
import { resolve } from "path";
import { config } from "dotenv";
import { EnvValidator, type IEnv } from "./env.validator";

export class EnvConfig {
  private static readonly _envMap: Record<string, TEnvironment> = {
    development: "dev",
    production: "prod",
    qa: "qa",
    dev: "dev",
    prod: "prod",
  };

  private static _loadCurrentEnvFile(env: TEnvironment) {
    config({ path: resolve(process.cwd(), `.env`) });

    if (!env) return;

    const envFilePath = resolve(process.cwd(), `.env.${env}`);
    config({ path: envFilePath, override: true });
  }

  static getCurrentEnv(): TEnvironment {
    const defaultEnv: TEnvironment = "dev";
    const currentEnv = process.env.NODE_ENV;

    if (!currentEnv) {
      process.env.NODE_ENV = defaultEnv;
      return defaultEnv;
    }

    const env = EnvConfig._envMap[currentEnv] ?? defaultEnv;

    process.env.NODE_ENV = env;
    return env;
  }

  static loadEnvConfig(): IEnv {
    const env = EnvConfig.getCurrentEnv();
    EnvConfig._loadCurrentEnvFile(env);
    return EnvValidator.validate(process.env);
  }
}
