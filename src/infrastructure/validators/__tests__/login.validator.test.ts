import { LoginValidator } from "../login.validator";
import { LoginDto } from "@/domain/dtos/login.dto";
import { ValidationError } from "@/domain/errors/validation-error";
import globalStrings from "@/config/strings/global.strings.json";

const { VALIDATION } = globalStrings.ERRORS.AUTH.REGISTER;

describe("LoginValidator", () => {
  describe("validate", () => {
    it("should return LoginDto when data is valid", () => {
      const validData = {
        email: "test@example.com",
        password: "ValidPass123!"
      };

      const result = LoginValidator.validate(validData);

      expect(result).toBeInstanceOf(LoginDto);
      expect(result.email).toBe(validData.email);
      expect(result.password).toBe(validData.password);
    });

    it("should throw ValidationError when email format is invalid", () => {
      const invalidData = {
        email: "invalid-email",
        password: "ValidPass123!"
      };

      expect(() => LoginValidator.validate(invalidData)).toThrow(ValidationError);
      expect(() => LoginValidator.validate(invalidData)).toThrow(VALIDATION.EMAIL.INVALID_FORMAT);
    });

    it("should throw ValidationError when password is too short", () => {
      const invalidData = {
        email: "test@example.com",
        password: "short"
      };

      expect(() => LoginValidator.validate(invalidData)).toThrow(ValidationError);
      expect(() => LoginValidator.validate(invalidData)).toThrow(VALIDATION.PASSWORD.MIN_LENGTH);
    });

    it("should throw ValidationError when password is too long", () => {
      const invalidData = {
        email: "test@example.com",
        password: "a".repeat(129) // 129 characters
      };

      expect(() => LoginValidator.validate(invalidData)).toThrow(ValidationError);
      expect(() => LoginValidator.validate(invalidData)).toThrow(VALIDATION.PASSWORD.MAX_LENGTH);
    });

    it("should throw ValidationError when password doesn't match regex", () => {
      const invalidData = {
        email: "test@example.com",
        password: "onlylowercase"
      };

      expect(() => LoginValidator.validate(invalidData)).toThrow(ValidationError);
      expect(() => LoginValidator.validate(invalidData)).toThrow(VALIDATION.PASSWORD.INVALID_FORMAT);
    });

    it("should throw ValidationError when email is missing", () => {
      const invalidData = {
        password: "ValidPass123!"
      };

      expect(() => LoginValidator.validate(invalidData)).toThrow(ValidationError);
    });

    it("should throw ValidationError when password is missing", () => {
      const invalidData = {
        email: "test@example.com"
      };

      expect(() => LoginValidator.validate(invalidData)).toThrow(ValidationError);
    });

    it("should throw ValidationError when both fields are missing", () => {
      const invalidData = {};

      expect(() => LoginValidator.validate(invalidData)).toThrow(ValidationError);
    });

    it("should throw ValidationError with correct field when email is invalid", () => {
      const invalidData = {
        email: "invalid-email",
        password: "ValidPass123!"
      };

      try {
        LoginValidator.validate(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe("email");
        expect((error as ValidationError).code).toBe("VALIDATION_ERROR");
      }
    });

    it("should throw ValidationError with correct field when password is invalid", () => {
      const invalidData = {
        email: "test@example.com",
        password: "short"
      };

      try {
        LoginValidator.validate(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe("password");
        expect((error as ValidationError).code).toBe("VALIDATION_ERROR");
      }
    });

    it("should handle empty string values gracefully", () => {
      const invalidData = {
        email: "",
        password: ""
      };

      expect(() => LoginValidator.validate(invalidData)).toThrow(ValidationError);
    });
  });
});