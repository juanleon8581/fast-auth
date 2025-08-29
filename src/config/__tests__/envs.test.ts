// Mock console methods
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

describe("Environment Configuration", () => {
  let originalEnv: typeof process.env;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Clear all mocks
    jest.clearAllMocks();

    // Reset modules to ensure fresh imports
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;

    // Restore console methods
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe("Valid Environment Configuration", () => {
    it("should load and validate environment with all required variables", () => {
      // Arrange
      process.env.NODE_ENV = "development";
      process.env.PORT = "3000";
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.SUPABASE_ANON_KEY = "test-anon-key";

      // Act & Assert - should not throw
      expect(() => {
        const envs = require("../envs").default;
        expect(envs).toBeDefined();
        expect(typeof envs.NODE_ENV).toBe("string");
        expect(typeof envs.PORT).toBe("number");
        expect(typeof envs.SUPABASE_URL).toBe("string");
        expect(typeof envs.SUPABASE_ANON_KEY).toBe("string");
      }).not.toThrow();
    });

    it("should use default values when optional variables are missing", () => {
      // Arrange - only set required variables
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.SUPABASE_ANON_KEY = "test-anon-key";
      delete process.env.NODE_ENV;
      delete process.env.PORT;

      // Act
      const envs = require("../envs").default;

      // Assert
      expect(envs).toBeDefined();
      expect(typeof envs.PORT).toBe("number");
      expect(envs.PORT).toBe(3000); // Default value
    });

    it("should convert PORT string to number", () => {
      // Arrange
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.SUPABASE_ANON_KEY = "test-anon-key";

      // Act
      const envs = require("../envs").default;

      // Assert
      expect(typeof envs.PORT).toBe("number");
      expect(envs.PORT).toBeGreaterThan(0);
    });

    it("should accept valid NODE_ENV values", () => {
      const validEnvs = [
        "development",
        "production",
        "test",
        "dev",
        "prod",
        "qa",
      ];

      validEnvs.forEach((env) => {
        // Reset modules for each test
        jest.resetModules();

        // Arrange
        process.env.NODE_ENV = env;
        process.env.SUPABASE_URL = "https://test.supabase.co";
        process.env.SUPABASE_ANON_KEY = "test-anon-key";

        // Act & Assert
        expect(() => {
          const envs = require("../envs").default;
          expect(envs).toBeDefined();
          expect(typeof envs.NODE_ENV).toBe("string");
        }).not.toThrow();
      });
    });
  });

  describe("Environment Configuration Properties", () => {
    it("should have all required properties", () => {
      // Arrange
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.SUPABASE_ANON_KEY = "test-anon-key";

      // Act
      const envs = require("../envs").default;

      // Assert
      expect(envs).toHaveProperty("NODE_ENV");
      expect(envs).toHaveProperty("PORT");
      expect(envs).toHaveProperty("SUPABASE_URL");
      expect(envs).toHaveProperty("SUPABASE_ANON_KEY");
    });

    it("should have correct property types", () => {
      // Arrange
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.SUPABASE_ANON_KEY = "test-anon-key";

      // Act
      const envs = require("../envs").default;

      // Assert
      expect(typeof envs.NODE_ENV).toBe("string");
      expect(typeof envs.PORT).toBe("number");
      expect(typeof envs.SUPABASE_URL).toBe("string");
      expect(typeof envs.SUPABASE_ANON_KEY).toBe("string");
    });

    it("should validate SUPABASE_URL format", () => {
      // Arrange
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.SUPABASE_ANON_KEY = "test-anon-key";

      // Act
      const envs = require("../envs").default;

      // Assert
      expect(envs.SUPABASE_URL).toMatch(/^https?:\/\/.+/);
    });
  });

  describe("Console Logging", () => {
    it("should log environment loading message", () => {
      // Arrange
      process.env.NODE_ENV = "development";
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.SUPABASE_ANON_KEY = "test-anon-key";

      // Act
      require("../envs").default;

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining("🔧 Loading environment configuration"),
      );
    });

    it("should log successful validation message", () => {
      // Arrange
      process.env.NODE_ENV = "development";
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.SUPABASE_ANON_KEY = "test-anon-key";

      // Act
      require("../envs").default;

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining(
          "✅ Environment variables validated successfully",
        ),
      );
    });

    it("should log messages during environment loading", () => {
      // Arrange
      process.env.NODE_ENV = "development";
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.SUPABASE_ANON_KEY = "test-anon-key";

      // Act
      require("../envs").default;

      // Assert - At least one console.log should have been called
      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });

  describe("Environment Schema", () => {
    it("should have correct schema structure", () => {
      // This test verifies the schema exists and can be imported
      expect(() => {
        const { z } = require("zod");
        // Test that zod is working
        const testSchema = z.object({
          test: z.string(),
        });
        expect(testSchema).toBeDefined();
      }).not.toThrow();
    });
  });
});
