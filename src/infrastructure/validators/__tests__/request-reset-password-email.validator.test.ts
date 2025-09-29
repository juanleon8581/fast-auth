import { RequestResetPasswordEmailValidator } from "../request-reset-password-email.validator";
import { RequestResetPasswordEmailDto } from "@/domain/dtos/request-reset-password-email.dto";
import globalStrings from "@/config/strings/global.strings.json";

// Mock RequestResetPasswordEmailDto
jest.mock("@/domain/dtos/request-reset-password-email.dto");

const MockedRequestResetPasswordEmailDto =
  RequestResetPasswordEmailDto as jest.MockedClass<
    typeof RequestResetPasswordEmailDto
  >;
const { DATA_VALIDATION } = globalStrings.ERRORS;
const { VALIDATION } = globalStrings.ERRORS.AUTH.REQUEST_RESET_PASSWORD_EMAIL;

describe("RequestResetPasswordEmailValidator", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock RequestResetPasswordEmailDto.createFrom to return a valid DTO
    const mockDto = {
      email: "test@example.com",
      redirectTo: "https://example.com/reset-password",
    } as RequestResetPasswordEmailDto;

    (
      MockedRequestResetPasswordEmailDto.createFrom as jest.Mock
    ).mockReturnValue([undefined, mockDto]);
  });

  describe("validate method", () => {
    describe("successful validation", () => {
      it("should validate correct data with email and redirectTo and return RequestResetPasswordEmailDto", () => {
        const validData = {
          email: "test@example.com",
          redirectTo: "https://example.com/reset-password",
        };

        const dto = RequestResetPasswordEmailValidator.validate(validData);

        expect(dto).toBeDefined();
        expect(
          MockedRequestResetPasswordEmailDto.createFrom,
        ).toHaveBeenCalledWith({
          email: "test@example.com",
          redirectTo: "https://example.com/reset-password",
        });
      });

      it("should validate correct data with only email and return RequestResetPasswordEmailDto", () => {
        const validData = {
          email: "test@example.com",
        };

        const dto = RequestResetPasswordEmailValidator.validate(validData);

        expect(dto).toBeDefined();
        expect(
          MockedRequestResetPasswordEmailDto.createFrom,
        ).toHaveBeenCalledWith({
          email: "test@example.com",
        });
      });

      it("should convert email to lowercase", () => {
        const validData = {
          email: "TEST@EXAMPLE.COM",
          redirectTo: "https://example.com/reset",
        };

        RequestResetPasswordEmailValidator.validate(validData);

        expect(
          MockedRequestResetPasswordEmailDto.createFrom,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            email: "test@example.com",
          }),
        );
      });

      it("should handle various valid email formats", () => {
        const validEmails = [
          "user@example.com",
          "test.email@domain.org",
          "user+tag@example.co.uk",
          "firstname.lastname@company.com",
        ];

        validEmails.forEach((email) => {
          const validData = { email };
          const dto = RequestResetPasswordEmailValidator.validate(validData);
          expect(dto).toBeDefined();
        });
      });

      it("should handle various valid redirect URLs", () => {
        const validUrls = [
          "https://example.com/reset",
          "https://www.myapp.com/auth/reset",
        ];

        validUrls.forEach((redirectTo) => {
          const validData = {
            email: "test@example.com",
            redirectTo,
          };
          const dto = RequestResetPasswordEmailValidator.validate(validData);
          expect(dto).toBeDefined();
        });
      });
    });

    describe("email validation errors", () => {
      it("should throw error for invalid email format", () => {
        const invalidData = {
          email: "invalid-email",
          redirectTo: "https://example.com/reset",
        };

        expect(() =>
          RequestResetPasswordEmailValidator.validate(invalidData),
        ).toThrow(VALIDATION.EMAIL.INVALID_FORMAT);
      });

      it("should throw error for email too long", () => {
        const invalidData = {
          email: "test@" + "a".repeat(250) + ".com",
          redirectTo: "https://example.com/reset",
        };

        expect(() =>
          RequestResetPasswordEmailValidator.validate(invalidData),
        ).toThrow(VALIDATION.EMAIL.MAX_LENGTH);
      });

      it("should throw error for missing email", () => {
        const invalidData = {
          redirectTo: "https://example.com/reset",
        };

        expect(() =>
          RequestResetPasswordEmailValidator.validate(invalidData),
        ).toThrow("Must be a valid email");
      });

      it("should throw error for empty email", () => {
        const invalidData = {
          email: "",
          redirectTo: "https://example.com/reset",
        };

        expect(() =>
          RequestResetPasswordEmailValidator.validate(invalidData),
        ).toThrow("Must be a valid email");
      });

      it("should throw error for null email", () => {
        const invalidData = {
          email: null,
          redirectTo: "https://example.com/reset",
        };

        expect(() =>
          RequestResetPasswordEmailValidator.validate(invalidData),
        ).toThrow("Must be a valid email");
      });
    });

    describe("redirectTo validation errors", () => {
      it("should throw error for invalid URL format", () => {
        const invalidData = {
          email: "test@example.com",
          redirectTo: "not-a-valid-url",
        };

        expect(() =>
          RequestResetPasswordEmailValidator.validate(invalidData),
        ).toThrow(VALIDATION.REDIRECT_TO.INVALID_FORMAT);
      });

      it("should throw error for redirectTo too long", () => {
        const invalidData = {
          email: "test@example.com",
          redirectTo: "https://example.com/" + "a".repeat(500),
        };

        expect(() =>
          RequestResetPasswordEmailValidator.validate(invalidData),
        ).toThrow(VALIDATION.REDIRECT_TO.MAX_LENGTH);
      });

      it("should throw error for invalid protocol", () => {
        const invalidData = {
          email: "test@example.com",
          redirectTo: "ftp://example.com/reset",
        };

        expect(() =>
          RequestResetPasswordEmailValidator.validate(invalidData),
        ).toThrow(VALIDATION.REDIRECT_TO.INVALID_FORMAT);
      });

      it("should throw error for URL without domain", () => {
        const invalidData = {
          email: "test@example.com",
          redirectTo: "https://",
        };

        expect(() =>
          RequestResetPasswordEmailValidator.validate(invalidData),
        ).toThrow(VALIDATION.REDIRECT_TO.INVALID_FORMAT);
      });
    });

    describe("DTO creation errors", () => {
      it("should throw BadRequestError when DTO creation fails", () => {
        const validData = {
          email: "test@example.com",
          redirectTo: "https://example.com/reset",
        };

        // Mock DTO creation to return an error
        (
          MockedRequestResetPasswordEmailDto.createFrom as jest.Mock
        ).mockReturnValue([DATA_VALIDATION.INVALID_DATA, undefined]);

        expect(() =>
          RequestResetPasswordEmailValidator.validate(validData),
        ).toThrow(DATA_VALIDATION.INVALID_DATA);
      });
    });

    describe("edge cases", () => {
      it("should handle empty object", () => {
        const invalidData = {};

        expect(() =>
          RequestResetPasswordEmailValidator.validate(invalidData),
        ).toThrow();
      });

      it("should handle null data", () => {
        expect(() =>
          RequestResetPasswordEmailValidator.validate(null as any),
        ).toThrow();
      });

      it("should handle undefined data", () => {
        expect(() =>
          RequestResetPasswordEmailValidator.validate(undefined as any),
        ).toThrow();
      });

      it("should handle data with extra fields", () => {
        const validData = {
          email: "test@example.com",
          redirectTo: "https://example.com/reset",
          extraField: "should be ignored",
        };

        const dto = RequestResetPasswordEmailValidator.validate(validData);

        expect(dto).toBeDefined();
        expect(
          MockedRequestResetPasswordEmailDto.createFrom,
        ).toHaveBeenCalledWith({
          email: "test@example.com",
          redirectTo: "https://example.com/reset",
        });
      });
    });

    describe("type coercion", () => {
      it("should handle email as string when passed as different type", () => {
        const validData = {
          email: "test@example.com",
          redirectTo: "https://example.com/reset",
        };

        const dto = RequestResetPasswordEmailValidator.validate(validData);

        expect(dto).toBeDefined();
      });
    });
  });
});
