import mockEnv from "@/tests/__mocks__/env.mock";
import { EnvConfig } from "../env.config";

//TODO: Validar la creación de un mock global para dotenv
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

describe("envs.test", () => {
  beforeEach(() => {
    process.env = { ...mockEnv };
    jest.clearAllMocks();
  });
  describe("envs module – Default export behavior 📦", () => {
    it("should call EnvConfig.loadEnvConfig once at module import", () => {
      const loadEnvConfigSpy = jest.spyOn(EnvConfig, "loadEnvConfig");
      require("../envs");
      expect(loadEnvConfigSpy).toHaveBeenCalledTimes(1);
    });

    it("should export the returned IEnv object from EnvConfig.loadEnvConfig", async () => {
      const envs = (await import("../envs")).default;
      expect(envs).toEqual(EnvConfig.loadEnvConfig());
    });

    it("should allow consumers to read normalized values (e.g., numeric PORT)", async () => {
      const envs = (await import("../envs")).default;
      expect(envs.PORT).toBe(Number(mockEnv.PORT));
    });
  });
});
