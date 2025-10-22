import cryptoConfig from "../crypto.config";

import type { TEnvironment } from "@/domain/shared/interfaces/environments.interfaces";

describe("crypto.config.test", () => {
  describe("CryptoConfig – Default shape and values", () => {
    it("should export a config object as default", () => {
      const cryptoConfigScope = require("../crypto.config").default;

      expect(cryptoConfigScope).toBeDefined();
      expect(typeof cryptoConfigScope).toBe("object");
      expect(Object.keys(cryptoConfigScope).length).toBe(4);
    });
    it("should have keysPath set to './.keys'", () => {
      expect(cryptoConfig.keysPath).toBe("./.keys");
    });
    it("should have cryptoEnvironment equal to ['prod', 'qa']", () => {
      expect(cryptoConfig.cryptoEnvironment).toEqual(["prod", "qa"]);
    });
    it("should set forceEncrypt to true", () => {
      expect(cryptoConfig.forceEncrypt).toBe(true);
    });
    it("should set disabledEncrypt to false", () => {
      expect(cryptoConfig.disabledEncrypt).toBe(false);
    });
  });

  describe("CryptoConfig – Environment values are compatible", () => {
    it("should include only valid TEnvironment values in cryptoEnvironment", () => {
      const validEnvironments: TEnvironment[] = ["prod", "qa", "dev"];

      expect(
        cryptoConfig.cryptoEnvironment.every((env: TEnvironment) =>
          validEnvironments.includes(env),
        ),
      ).toBe(true);
    });
    it("should not include duplicates in cryptoEnvironment", () => {
      const uniqueEnvironments = new Set(cryptoConfig.cryptoEnvironment);
      expect(uniqueEnvironments.size).toBe(
        cryptoConfig.cryptoEnvironment.length,
      );
    });
  });

  describe("CryptoConfig – Immutability and freeze behavior", () => {
    it("should be frozen at the top-level (Object.isFrozen returns true)", () => {
      expect(Object.isFrozen(cryptoConfig)).toBe(true);
    });
    it("should not allow reassigning top-level properties (e.g., keysPath)", () => {
      expect(() => {
        (cryptoConfig as any).keysPath = "./.keys2";
      }).toThrow();
    });
    it("should not allow reassigning cryptoEnvironment to a new array", () => {
      expect(() => {
        (cryptoConfig as any).cryptoEnvironment = ["dev"];
      }).toThrow();
    });
    it("should not allow mutating nested array contents due to deep freeze", () => {
      expect(() => {
        (cryptoConfig as any).cryptoEnvironment.push("dev");
      }).toThrow();
    });
  });

  describe("CryptoConfig – Consumer contract hints", () => {
    it("should avoid contradictory flags: forceEncrypt and disabledEncrypt should not both be true", () => {
      expect(typeof cryptoConfig.disabledEncrypt).toBe("boolean");
      expect(typeof cryptoConfig.forceEncrypt).toBe("boolean");
      if (cryptoConfig.disabledEncrypt) {
        expect(cryptoConfig.forceEncrypt).toBe(false);
      }
      if (cryptoConfig.forceEncrypt) {
        expect(cryptoConfig.disabledEncrypt).toBe(false);
      }
    });
  });
});
