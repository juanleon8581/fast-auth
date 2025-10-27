import mockEnv from "@/tests/__mocks__/env.mock";
import { EnvConfig } from "../env.config";

jest.mock("dotenv", () => ({
  config: jest.fn(),
}));
jest.mock("../env.validator", () => ({
  EnvValidator: {
    validate: jest.fn().mockImplementation((env) => {
      const envs: IEnv = {
        NODE_ENV: env.NODE_ENV,
        PORT: Number(env.PORT),
        SUPABASE_URL: env.SUPABASE_URL,
        SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
        JWT_SECRET: env.JWT_SECRET,
        DATABASE_URL: env.DATABASE_URL,
        PASSPHRASE: env.PASSPHRASE,
        LOG_TRANSPORT: env.LOG_TRANSPORT,
        LOG_LEVEL: env.LOG_LEVEL,
      };
      return envs;
    }),
  },
}));

import { config } from "dotenv";
import { TEnvironment } from "@/domain/shared/interfaces/environments.interfaces";
import { EnvValidator, IEnv } from "../env.validator";

describe("EnvConfig test suite", () => {
  let originalEnv: typeof process.env;
  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });
  describe("EnvConfig – Environment detection and loading 🕢", () => {
    it("should return 'dev' as default when NODE_ENV is undefined", async () => {
      const { NODE_ENV, ...env } = mockEnv;
      process.env = env;

      expect(process.env.NODE_ENV).toBeUndefined();

      const envs = EnvConfig.loadEnvConfig();

      expect(process.env.NODE_ENV).toEqual(NODE_ENV);
      expect(envs.NODE_ENV).toBe("dev");
    });

    it("should map 'development' to 'dev'", () => {
      process.env = { ...mockEnv };
      process.env.NODE_ENV = "development";
      const envs = EnvConfig.loadEnvConfig();
      expect(envs.NODE_ENV).toBe("dev");
    });

    it("should map 'qa' to 'qa'", () => {
      process.env = { ...mockEnv };
      process.env.NODE_ENV = "qa";
      const envs = EnvConfig.loadEnvConfig();
      expect(envs.NODE_ENV).toBe("qa");
    });

    it("should keep 'dev' as 'dev' when already normalized", () => {
      process.env = { ...mockEnv };
      process.env.NODE_ENV = "dev";
      const envs = EnvConfig.loadEnvConfig();
      expect(envs.NODE_ENV).toBe("dev");
    });

    it("should keep 'prod' as 'prod' when already normalized", () => {
      process.env = { ...mockEnv };
      process.env.NODE_ENV = "prod";
      const envs = EnvConfig.loadEnvConfig();
      expect(envs.NODE_ENV).toBe("prod");
    });

    it("should return 'dev' for unknown NODE_ENV values", () => {
      process.env = { ...mockEnv };
      process.env.NODE_ENV = "unknown";
      const envs = EnvConfig.loadEnvConfig();
      expect(envs.NODE_ENV).toBe("dev");
    });

    it("should load base .env and environment .env.{env} in correct order", () => {
      process.env = { ...mockEnv };
      process.env.NODE_ENV = "qa";
      const envs = EnvConfig.loadEnvConfig();
      expect(envs.NODE_ENV).toBe("qa");
      expect(config).toHaveBeenCalledTimes(2);
      expect(config).toHaveBeenNthCalledWith(1, {
        path: expect.stringContaining(".env"),
      });
      expect(config).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          path: expect.stringContaining(".env.qa"),
        }),
      );
    });

    it("should call dotenv.config twice with expected paths and override on the second call", () => {
      process.env = { ...mockEnv };
      EnvConfig.loadEnvConfig();
      expect(config).toHaveBeenCalledTimes(2);
      expect(config).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          override: true,
        }),
      );
    });

    it("should orchestrate getCurrentEnv → _loadCurrentEnvFile → EnvValidator.validate", () => {
      const callOrder: Record<string, string> = {};
      const getCurrentEnvSpy = jest
        .spyOn(EnvConfig, "getCurrentEnv")
        .mockImplementation(() => {
          if (callOrder.firstCall) return "dev";
          callOrder.firstCall = "getCurrentEnv";
          return "dev";
        });
      const loadCurrentEnvFileSpy = jest
        .spyOn(EnvConfig as any, "_loadCurrentEnvFile")
        .mockImplementation(() => {
          if (callOrder.secondCall) return;
          callOrder.secondCall = "loadCurrentEnvFile";
        });

      process.env = { ...mockEnv };
      EnvConfig.loadEnvConfig();

      expect(getCurrentEnvSpy).toHaveBeenCalled();
      expect(getCurrentEnvSpy).toHaveReturnedWith("dev");
      expect(callOrder.firstCall).toBe("getCurrentEnv");
      expect(loadCurrentEnvFileSpy).toHaveBeenCalled();
      expect(callOrder.secondCall).toBe("loadCurrentEnvFile");
    });
  });

  describe("EnvConfig.getCurrentEnv – Normalization rules 📄", () => {
    it("should use default environment when process.env.NODE_ENV is missing", () => {
      process.env = { ...mockEnv };
      delete process.env.NODE_ENV;
      expect(process.env.NODE_ENV).toBeUndefined();
      const defaultEnv = EnvConfig.getCurrentEnv();
      expect(defaultEnv).toBe("dev");
    });

    it("should accept already short-form names: dev, prod, qa", () => {
      process.env = { ...mockEnv };
      const shortFormEnvs: TEnvironment[] = ["dev", "prod", "qa"];
      shortFormEnvs.forEach((env) => {
        process.env.NODE_ENV = env;
        const normalizedEnv = EnvConfig.getCurrentEnv();
        expect(normalizedEnv).toEqual(env);
      });
    });

    it("should fallback to default for unsupported values like 'staging'", () => {
      process.env = { ...mockEnv };
      process.env.NODE_ENV = "staging";
      const defaultEnv = EnvConfig.getCurrentEnv();
      expect(defaultEnv).toBe("dev");
    });
  });

  describe("EnvConfig._loadCurrentEnvFile – dotenv usage ✏️", () => {
    let loadCurrentEnvFileSpy: jest.SpyInstance<any, unknown[], any>;

    beforeEach(() => {
      loadCurrentEnvFileSpy = jest.spyOn(
        EnvConfig as any,
        "_loadCurrentEnvFile",
      );
    });

    it("should first load .env without override", () => {
      (EnvConfig as any)._loadCurrentEnvFile();

      expect(loadCurrentEnvFileSpy).toHaveBeenCalledTimes(1);
      expect(config).toHaveBeenCalledTimes(1);
      expect(config).toHaveBeenCalledWith(
        expect.not.objectContaining({
          override: true,
        }),
      );
    });

    it("should load .env.{env} with override true", () => {
      (EnvConfig as any)._loadCurrentEnvFile("qa");

      expect(loadCurrentEnvFileSpy).toHaveBeenCalledTimes(1);
      expect(config).toHaveBeenCalledTimes(2);
      expect(config).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          override: true,
        }),
      );
    });

    it("should resolve paths using process.cwd()", () => {
      const mockPath = "/mock/cwd";
      const processCwdSpy = jest
        .spyOn(process, "cwd")
        .mockReturnValue(mockPath);
      (EnvConfig as any)._loadCurrentEnvFile("qa");

      expect(processCwdSpy).toHaveBeenCalledTimes(2);
      expect(config).toHaveBeenCalledTimes(2);
      [1, 2].forEach((call) => {
        expect(config).toHaveBeenNthCalledWith(
          call,
          expect.objectContaining({
            path: expect.stringContaining(mockPath),
          }),
        );
      });
    });
  });

  describe("EnvConfig.loadEnvConfig – Integration with validator  🔗", () => {
    it("should return the validated IEnv result from EnvValidator.validate", () => {
      const validatedEnv = EnvConfig.loadEnvConfig();
      expect(validatedEnv).toBeDefined();
      expect(
        ["dev", "prod", "qa", "development", "production"].includes(
          validatedEnv.NODE_ENV,
        ),
      ).toBe(true);
      expect(typeof validatedEnv.PORT).toBe("number");
      expect(typeof validatedEnv.SUPABASE_URL).toBe("string");
      expect(typeof validatedEnv.SUPABASE_ANON_KEY).toBe("string");
      expect(typeof validatedEnv.PASSPHRASE).toBe("string");
      expect(typeof validatedEnv.JWT_SECRET).toBe("string");
      expect(typeof validatedEnv.DATABASE_URL).toBe("string");
    });

    it("should pass process.env object into EnvValidator.validate", () => {
      const validateSpy = jest.spyOn(EnvValidator, "validate");
      EnvConfig.loadEnvConfig();

      expect(validateSpy).toHaveBeenCalledWith(process.env);
    });

    it("should call getCurrentEnv before loading files", () => {
      const getCurrentEnvSpy = jest.spyOn(EnvConfig, "getCurrentEnv");
      const loadCurrentEnvFileSpy = jest
        .spyOn(EnvConfig as any, "_loadCurrentEnvFile")
        .mockImplementation(() => {
          expect(getCurrentEnvSpy).toHaveBeenCalledTimes(1);
        });

      EnvConfig.loadEnvConfig();
      expect(loadCurrentEnvFileSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle validation errors by rethrowing the error from EnvValidator.validate", () => {
      process.env = { ...mockEnv };
      process.env.PORT = "invalid";

      EnvValidator.validate = jest.fn().mockImplementation(() => {
        throw new Error("Validation error");
      });

      expect(() => EnvConfig.loadEnvConfig()).toThrow();
      expect(EnvValidator.validate).toHaveBeenCalledTimes(1);
      expect(EnvValidator.validate).toHaveBeenCalledWith(process.env);
      expect(EnvValidator.validate).toHaveBeenCalledWith(
        expect.objectContaining({
          PORT: "invalid",
        }),
      );
    });
  });
});
