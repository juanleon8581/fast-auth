import { LogoutValidator } from "../logout.validator";
import { LogoutDto } from "@/domain/auth/dtos/logout.dto";
import { ValidationError } from "@/domain/errors/validation-error";
import globalStrings from "@/config/strings/global.strings.json";

const { VALIDATION } = globalStrings.ERRORS.AUTH.LOGOUT;

describe("LogoutValidator", () => {
  describe("validate", () => {
    it("should return LogoutDto when data is valid", () => {
      const validData = {
        sessionToken: "session-token-123",
        refreshToken: "refresh-token-456",
      };

      const result = LogoutValidator.validate(validData);

      expect(result).toBeInstanceOf(LogoutDto);
      expect(result.sessionToken).toBe(validData.sessionToken);
      expect(result.refreshToken).toBe(validData.refreshToken);
    });

    it("should work with JWT-like tokens", () => {
      const validData = {
        sessionToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.session",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh",
      };

      const result = LogoutValidator.validate(validData);

      expect(result).toBeInstanceOf(LogoutDto);
      expect(result.sessionToken).toBe(validData.sessionToken);
      expect(result.refreshToken).toBe(validData.refreshToken);
    });

    it("should throw ValidationError when sessionToken is missing", () => {
      const invalidData = {
        refreshToken: "refresh-token-456",
      };

      expect(() => LogoutValidator.validate(invalidData)).toThrow(
        ValidationError,
      );
      expect(() => LogoutValidator.validate(invalidData)).toThrow(
        VALIDATION.ACCESS_TOKEN.REQUIRED,
      );
    });

    it("should throw ValidationError when refreshToken is missing", () => {
      const invalidData = {
        sessionToken: "session-token-123",
      };

      expect(() => LogoutValidator.validate(invalidData)).toThrow(
        ValidationError,
      );
      expect(() => LogoutValidator.validate(invalidData)).toThrow(
        VALIDATION.REFRESH_TOKEN.REQUIRED,
      );
    });

    it("should throw ValidationError when sessionToken is empty string", () => {
      const invalidData = {
        sessionToken: "",
        refreshToken: "refresh-token-456",
      };

      expect(() => LogoutValidator.validate(invalidData)).toThrow(
        ValidationError,
      );
      expect(() => LogoutValidator.validate(invalidData)).toThrow(
        VALIDATION.ACCESS_TOKEN.REQUIRED,
      );
    });

    it("should throw ValidationError when refreshToken is empty string", () => {
      const invalidData = {
        sessionToken: "session-token-123",
        refreshToken: "",
      };

      expect(() => LogoutValidator.validate(invalidData)).toThrow(
        ValidationError,
      );
      expect(() => LogoutValidator.validate(invalidData)).toThrow(
        VALIDATION.REFRESH_TOKEN.REQUIRED,
      );
    });

    it("should throw ValidationError when both fields are missing", () => {
      const invalidData = {};

      expect(() => LogoutValidator.validate(invalidData)).toThrow(
        ValidationError,
      );
    });

    it("should throw ValidationError when both fields are empty strings", () => {
      const invalidData = {
        sessionToken: "",
        refreshToken: "",
      };

      expect(() => LogoutValidator.validate(invalidData)).toThrow(
        ValidationError,
      );
    });

    it("should throw ValidationError with correct field when sessionToken is invalid", () => {
      const invalidData = {
        sessionToken: "",
        refreshToken: "refresh-token-456",
      };

      try {
        LogoutValidator.validate(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe("sessionToken");
        expect((error as ValidationError).code).toBe("VALIDATION_ERROR");
      }
    });

    it("should throw ValidationError with correct field when refreshToken is invalid", () => {
      const invalidData = {
        sessionToken: "session-token-123",
        refreshToken: "",
      };

      try {
        LogoutValidator.validate(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe("refreshToken");
        expect((error as ValidationError).code).toBe("VALIDATION_ERROR");
      }
    });

    it("should handle null values", () => {
      const invalidData = {
        sessionToken: null,
        refreshToken: "refresh-token-456",
      };

      expect(() => LogoutValidator.validate(invalidData)).toThrow(
        ValidationError,
      );
    });

    it("should handle undefined values", () => {
      const invalidData = {
        sessionToken: "session-token-123",
        refreshToken: undefined,
      };

      expect(() => LogoutValidator.validate(invalidData)).toThrow(
        ValidationError,
      );
    });

    it("should handle non-string values", () => {
      const invalidData = {
        sessionToken: 123,
        refreshToken: "refresh-token-456",
      };

      expect(() => LogoutValidator.validate(invalidData)).toThrow(
        ValidationError,
      );
    });
  });
});
