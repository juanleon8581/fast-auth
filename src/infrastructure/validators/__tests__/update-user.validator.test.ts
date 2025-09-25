import { UpdateUserValidator } from "../update-user.validator";
import { UpdateUserDto } from "@/domain/dtos/update-user.dto";
import globalStrings from "@/config/strings/global.strings.json";
import { ValidationError } from "@/domain/errors/validation-error";
import { BadRequestError } from "@/domain/errors/bad-request-error";

// Mock UpdateUserDto
jest.mock("@/domain/dtos/update-user.dto");

const MockedUpdateUserDto = UpdateUserDto as jest.MockedClass<typeof UpdateUserDto>;
const { VALIDATION } = globalStrings.ERRORS.AUTH.UPDATE_USER;

describe("UpdateUserValidator", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock UpdateUserDto.createFrom to return a valid DTO
    const mockDto = {
      sessionToken: "session-token-123",
      refreshToken: "refresh-token-456",
      email: "user@example.com",
      newPassword: "NewSecurePass123!",
      newPasswordConfirmation: "NewSecurePass123!",
      phone: "+1234567890",
      redirectionLink: "https://example.com/redirect",
    } as UpdateUserDto;

    (MockedUpdateUserDto.createFrom as jest.Mock).mockReturnValue([
      undefined,
      mockDto,
    ]);
  });

  describe("validate method", () => {
    describe("successful validation", () => {
      it("should validate correct data with all fields and return UpdateUserDto", () => {
        const validData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          email: "user@example.com",
          newPassword: "NewSecurePass123!",
          newPasswordConfirmation: "NewSecurePass123!",
          phone: "+1234567890",
          redirectionLink: "https://example.com/redirect",
        };

        const dto = UpdateUserValidator.validate(validData);

        expect(dto).toBeDefined();
        expect(MockedUpdateUserDto.createFrom).toHaveBeenCalledWith(validData);
      });

      it("should validate data with only required fields", () => {
        const validData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
        };

        const dto = UpdateUserValidator.validate(validData);

        expect(dto).toBeDefined();
        expect(MockedUpdateUserDto.createFrom).toHaveBeenCalledWith(validData);
      });

      it("should validate data with empty optional fields", () => {
        const validData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          email: "",
          newPassword: "",
          newPasswordConfirmation: "",
          phone: "",
          redirectionLink: "",
        };

        const dto = UpdateUserValidator.validate(validData);

        expect(dto).toBeDefined();
        expect(MockedUpdateUserDto.createFrom).toHaveBeenCalledWith(validData);
      });

      it("should validate data with only email update", () => {
        const validData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          email: "newemail@example.com",
        };

        const dto = UpdateUserValidator.validate(validData);

        expect(dto).toBeDefined();
        expect(MockedUpdateUserDto.createFrom).toHaveBeenCalledWith(validData);
      });

      it("should validate data with only phone update", () => {
        const validData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          phone: "+9876543210",
        };

        const dto = UpdateUserValidator.validate(validData);

        expect(dto).toBeDefined();
        expect(MockedUpdateUserDto.createFrom).toHaveBeenCalledWith(validData);
      });

      it("should validate data with password update", () => {
        const validData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          newPassword: "NewSecurePass123!",
          newPasswordConfirmation: "NewSecurePass123!",
        };

        const dto = UpdateUserValidator.validate(validData);

        expect(dto).toBeDefined();
        expect(MockedUpdateUserDto.createFrom).toHaveBeenCalledWith(validData);
      });
    });

    describe("validation errors - required fields", () => {
      it("should throw ValidationError when sessionToken is missing", () => {
        const invalidData = {
          refreshToken: "refresh-token-456",
        };

        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          ValidationError,
        );
        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          VALIDATION.SESSION_TOKEN.REQUIRED,
        );
      });

      it("should throw ValidationError when sessionToken is empty", () => {
        const invalidData = {
          sessionToken: "",
          refreshToken: "refresh-token-456",
        };

        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          ValidationError,
        );
        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          VALIDATION.SESSION_TOKEN.REQUIRED,
        );
      });

      it("should throw ValidationError when refreshToken is missing", () => {
        const invalidData = {
          sessionToken: "session-token-123",
        };

        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          ValidationError,
        );
        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          VALIDATION.REFRESH_TOKEN.REQUIRED,
        );
      });

      it("should throw ValidationError when refreshToken is empty", () => {
        const invalidData = {
          sessionToken: "session-token-123",
          refreshToken: "",
        };

        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          ValidationError,
        );
        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          VALIDATION.REFRESH_TOKEN.REQUIRED,
        );
      });
    });

    describe("validation errors - email format", () => {
      it("should throw ValidationError when email format is invalid", () => {
        const invalidData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          email: "invalid-email",
        };

        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          ValidationError,
        );
        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          VALIDATION.EMAIL.INVALID_FORMAT,
        );
      });

      it("should throw ValidationError when email is missing @ symbol", () => {
        const invalidData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          email: "userexample.com",
        };

        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          ValidationError,
        );
        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          VALIDATION.EMAIL.INVALID_FORMAT,
        );
      });
    });

    describe("validation errors - password", () => {
      it("should throw ValidationError when newPassword is too short", () => {
        const invalidData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          newPassword: "Short1!",
          newPasswordConfirmation: "Short1!",
        };

        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          ValidationError,
        );
        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          VALIDATION.NEW_PASSWORD.MIN_LENGTH,
        );
      });

      it("should throw ValidationError when newPassword is too long", () => {
        const invalidData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          newPassword: "a".repeat(129) + "A1!",
          newPasswordConfirmation: "a".repeat(129) + "A1!",
        };

        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          ValidationError,
        );
        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          VALIDATION.NEW_PASSWORD.MAX_LENGTH,
        );
      });

      it("should throw ValidationError when newPassword doesn't match regex", () => {
        const invalidData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          newPassword: "onlylowercase",
          newPasswordConfirmation: "onlylowercase",
        };

        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          ValidationError,
        );
        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          VALIDATION.NEW_PASSWORD.INVALID_FORMAT,
        );
      });

      it("should throw ValidationError when newPasswordConfirmation is missing but newPassword is provided", () => {
        const invalidData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          newPassword: "NewSecurePass123!",
        };

        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          ValidationError,
        );
        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          VALIDATION.NEW_PASSWORD_CONFIRMATION.REQUIRED_WITH_PASSWORD,
        );
      });

      it("should throw ValidationError when passwords don't match", () => {
        const invalidData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          newPassword: "NewSecurePass123!",
          newPasswordConfirmation: "DifferentPass123!",
        };

        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          ValidationError,
        );
        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          VALIDATION.NEW_PASSWORD_CONFIRMATION.MUST_MATCH,
        );
      });
    });

    describe("validation errors - phone", () => {
      it("should throw ValidationError when phone format is invalid", () => {
        const invalidData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          phone: "1234567890", // Missing + prefix
        };

        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          ValidationError,
        );
        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          VALIDATION.PHONE.INVALID_FORMAT,
        );
      });

      it("should throw ValidationError when phone has invalid characters", () => {
        const invalidData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          phone: "+1-234-567-890", // Contains hyphens
        };

        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          ValidationError,
        );
        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          VALIDATION.PHONE.INVALID_FORMAT,
        );
      });
    });

    describe("validation errors - redirection link", () => {
      it("should throw ValidationError when redirectionLink is not a valid URL", () => {
        const invalidData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          redirectionLink: "not-a-url",
        };

        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          ValidationError,
        );
        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          VALIDATION.REDIRECTION_LINK.INVALID_FORMAT,
        );
      });

      it("should throw ValidationError when redirectionLink has wrong protocol", () => {
        const invalidData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          redirectionLink: "ftp://example.com",
        };

        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          ValidationError,
        );
        expect(() => UpdateUserValidator.validate(invalidData)).toThrow(
          VALIDATION.REDIRECTION_LINK.INVALID_FORMAT,
        );
      });
    });

    describe("DTO creation errors", () => {
      it("should throw BadRequestError when DTO creation fails", () => {
        const validData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
        };

        // Mock DTO creation to return an error
        (MockedUpdateUserDto.createFrom as jest.Mock).mockReturnValue([
          "DTO creation error",
          undefined,
        ]);

        expect(() => UpdateUserValidator.validate(validData)).toThrow(
          BadRequestError,
        );
        expect(() => UpdateUserValidator.validate(validData)).toThrow(
          "DTO creation error",
        );
      });
    });

    describe("edge cases", () => {
      it("should handle null data", () => {
        expect(() => UpdateUserValidator.validate(null as any)).toThrow(
          ValidationError,
        );
      });

      it("should handle undefined data", () => {
        expect(() => UpdateUserValidator.validate(undefined as any)).toThrow(
          ValidationError,
        );
      });

      it("should handle empty object", () => {
        expect(() => UpdateUserValidator.validate({})).toThrow(
          ValidationError,
        );
      });

      it("should handle data with extra properties", () => {
        const validData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          extraProperty: "should be ignored",
        };

        const dto = UpdateUserValidator.validate(validData);

        expect(dto).toBeDefined();
        expect(MockedUpdateUserDto.createFrom).toHaveBeenCalledWith({
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
        });
      });
    });

    describe("complex scenarios", () => {
      it("should validate complete user update with all fields", () => {
        const validData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          email: "updated@example.com",
          newPassword: "NewSecurePass123!",
          newPasswordConfirmation: "NewSecurePass123!",
          phone: "+1987654321",
          redirectionLink: "https://myapp.com/profile-updated",
        };

        const dto = UpdateUserValidator.validate(validData);

        expect(dto).toBeDefined();
        expect(MockedUpdateUserDto.createFrom).toHaveBeenCalledWith(validData);
      });

      it("should validate partial update with only email and phone", () => {
        const validData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          email: "newemail@example.com",
          phone: "+1555123456",
        };

        const dto = UpdateUserValidator.validate(validData);

        expect(dto).toBeDefined();
        expect(MockedUpdateUserDto.createFrom).toHaveBeenCalledWith(validData);
      });

      it("should validate update with complex email formats", () => {
        const validData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          email: "user+tag@sub.domain.co.uk",
        };

        const dto = UpdateUserValidator.validate(validData);

        expect(dto).toBeDefined();
        expect(MockedUpdateUserDto.createFrom).toHaveBeenCalledWith(validData);
      });

      it("should validate update with complex URL formats", () => {
        const validData = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          redirectionLink: "https://app.example.com:8080/path/to/resource?param=value&other=123#section",
        };

        const dto = UpdateUserValidator.validate(validData);

        expect(dto).toBeDefined();
        expect(MockedUpdateUserDto.createFrom).toHaveBeenCalledWith(validData);
      });
    });
  });
});