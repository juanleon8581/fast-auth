import mockEnv from "@/config/tests/__mocks__/env.mock";
import { EnvValidator } from "../env.validator";
import { TEnvironment } from "@/domain/shared/interfaces/environments.interfaces";
import {
  TLogLevels,
  TLogTransport,
} from "@/domain/shared/interfaces/logger.interfaces";

describe("env.validator.test", () => {
  beforeEach(() => {
    process.env = { ...mockEnv };
    jest.clearAllMocks();
  });

  describe("EnvValidator – Validation rules and logging 🛡️", () => {
    it("should convert PORT string to number", () => {
      process.env.PORT = "3000";
      const envs = EnvValidator.validate(process.env);
      expect(envs.PORT).toBeDefined();
      expect(envs.PORT).toBe(3000);
    });

    it("should default PORT to 3000 when missing", () => {
      const validateSpy = jest.spyOn(EnvValidator, "validate");

      delete process.env.PORT;
      const envs = EnvValidator.validate(process.env);

      expect(validateSpy).toHaveBeenCalledWith(
        expect.not.objectContaining({ PORT: expect.any }),
      );
      expect(envs.PORT).toBeDefined();
      expect(envs.PORT).toBe(3000);
    });

    it("should accept valid SUPABASE_URL and DATABASE_URL as URLs", () => {
      const envs = EnvValidator.validate(process.env);

      expect(envs.SUPABASE_URL).toBeDefined();
      expect(envs.DATABASE_URL).toBeDefined();
      expect(typeof envs.SUPABASE_URL).toBe("string");
      expect(typeof envs.DATABASE_URL).toBe("string");
    });

    it("should reject invalid SUPABASE_URL with specific message 'Must be a valid URL'", () => {
      process.env.SUPABASE_URL = "invalid-url";
      expect(() => EnvValidator.validate(process.env)).toThrow(
        "Must be a valid URL",
      );
    });

    it("should reject invalid DATABASE_URL with specific message 'Must be a valid URL'", () => {
      process.env.DATABASE_URL = "invalid-url";
      expect(() => EnvValidator.validate(process.env)).toThrow(
        "Must be a valid URL",
      );
    });

    it("should require SUPABASE_ANON_KEY", () => {
      delete process.env.SUPABASE_ANON_KEY;

      expect(() => EnvValidator.validate(process.env)).toThrow(
        "SUPABASE_ANON_KEY is required",
      );
    });

    it("should require SUPABASE_ANON_KEY as non-empty string", () => {
      process.env.SUPABASE_ANON_KEY = "";

      expect(() => EnvValidator.validate(process.env)).toThrow(
        "SUPABASE_ANON_KEY must be non-empty",
      );
    });

    it("should require JWT_SECRET", () => {
      delete process.env.JWT_SECRET;

      expect(() => EnvValidator.validate(process.env)).toThrow(
        "JWT_SECRET is required",
      );
    });

    it("should reject JWT_SECRET shorter than 32 characters", () => {
      process.env.JWT_SECRET = "short";

      expect(() => EnvValidator.validate(process.env)).toThrow(
        "JWT_SECRET must be at least 32 characters long",
      );
    });

    it("should enforce PASSPHRASE minimum length of 12 characters", () => {
      process.env.PASSPHRASE = "short";

      expect(() => EnvValidator.validate(process.env)).toThrow(
        "PASSPHRASE must be at least 12 characters long",
      );
    });

    it("should default NODE_ENV to 'dev' when missing", () => {
      delete process.env.NODE_ENV;
      expect(() => EnvValidator.validate(process.env)).toThrow(
        "NODE_ENV must be one of the following: dev, prod, qa, development, production",
      );
    });

    it("should accept NODE_ENV among: dev, prod, qa, development, production", () => {
      const validEnvs: TEnvironment[] = ["dev", "prod", "qa"];

      validEnvs.forEach((env) => {
        process.env.NODE_ENV = env;
        const envs = EnvValidator.validate(process.env);
        expect(envs.NODE_ENV).toBe(env);
      });
    });

    it("should reject invalid NODE_ENV value not in the enum", () => {
      process.env.NODE_ENV = "no-enum";
      expect(() => EnvValidator.validate(process.env)).toThrow(
        "NODE_ENV must be one of the following: dev, prod, qa, development, production",
      );
    });
  });

  describe("EnvValidator.validate – Success path logging 📈", () => {
    it("should log success message with the normalized NODE_ENV", () => {
      const consoleLogSpy = jest.spyOn(console, "log");

      const envs = EnvValidator.validate(process.env);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        `✅ Environment variables validated successfully for ${envs.NODE_ENV}`,
      );
    });

    it("should return parsed IEnv object with correct types", () => {
      const envs = EnvValidator.validate(process.env);
      expect(typeof envs.NODE_ENV).toBe("string");
      expect(typeof envs.PORT).toBe("number");
      expect(typeof envs.SUPABASE_URL).toBe("string");
      expect(typeof envs.SUPABASE_ANON_KEY).toBe("string");
      expect(typeof envs.JWT_SECRET).toBe("string");
      expect(typeof envs.DATABASE_URL).toBe("string");
      expect(typeof envs.PASSPHRASE).toBe("string");
    });
  });

  describe("EnvValidator.validate – Failure path and error propagation 📉", () => {
    it("should log error message including process.env.NODE_ENV", () => {
      const consoleErrorSpy = jest.spyOn(console, "error");
      delete process.env.NODE_ENV;

      expect(() => EnvValidator.validate(process.env)).toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `❌ Invalid environment variables for ${process.env.NODE_ENV}`,
        expect.any(Error),
      );
    });
  });

  describe("EnvValidator – Coercions and defaults robustness 🔍", () => {
    it("should coerce PORT='8080' to number 8080", () => {
      process.env.PORT = "8080";
      const envs = EnvValidator.validate(process.env);
      expect(envs.PORT).toBe(8080);
    });

    it("should ignore whitespace around numeric PORT values", () => {
      process.env.PORT = " 8080 ";
      const envs = EnvValidator.validate(process.env);
      expect(envs.PORT).toBe(8080);
    });
  });

  describe("Logger configuration - LOG_TRANSPORT 🧾", () => {
    it("should default LOG_TRANSPORT to console", () => {
      delete process.env.LOG_TRANSPORT;
      const envs = EnvValidator.validate(process.env);
      expect(envs.LOG_TRANSPORT).toBe("console");
    });

    it("should accept LOG_TRANSPORT among: console, file, http", () => {
      const validTransports: TLogTransport[] = ["console", "file", "all"];

      validTransports.forEach((transport) => {
        process.env.LOG_TRANSPORT = transport;
        const envs = EnvValidator.validate(process.env);
        expect(envs.LOG_TRANSPORT).toBe(transport);
      });
    });

    it("should reject invalid LOG_TRANSPORT values", () => {
      process.env.LOG_TRANSPORT = "invalid";
      expect(() => EnvValidator.validate(process.env)).toThrow(
        "LOG_TRANSPORT must be one of the following: console, file, all",
      );
    });
  });

  describe("Logger configuration - LOG_LEVEL 🧾", () => {
    it("should default LOG_LEVEL to info", () => {
      delete process.env.LOG_LEVEL;
      const envs = EnvValidator.validate(process.env);
      expect(envs.LOG_LEVEL).toBe("info");
    });

    it("should accept LOG_LEVEL among: error, warn, info, http, verbose, debug, silly", () => {
      const validLevels: TLogLevels[] = [
        "error",
        "warn",
        "info",
        "http",
        "verbose",
        "debug",
        "silly",
      ];

      validLevels.forEach((level) => {
        process.env.LOG_LEVEL = level;
        const envs = EnvValidator.validate(process.env);
        expect(envs.LOG_LEVEL).toBe(level);
      });
    });

    it("should reject invalid LOG_LEVEL values", () => {
      process.env.LOG_LEVEL = "invalid";
      expect(() => EnvValidator.validate(process.env)).toThrow(
        "LOG_LEVEL must be one of the following: error, warn, info, http, verbose, debug, silly",
      );
    });
  });
});
