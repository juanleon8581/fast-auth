import { RegisterValidator } from "../register.validator";
import { RegisterDto } from "@/domain/auth/dtos/register.dto";
import { TUserRole } from "@/domain/auth/interfaces/auth-user.interfaces";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";

// Mock RegisterDto
jest.mock("@/domain/auth/dtos/register.dto");

const MockedRegisterDto = RegisterDto;
const { DATA_VALIDATION } = ERROR_MESSAGES;
const { VALIDATION } = ERROR_MESSAGES.AUTH.REGISTER;

describe("RegisterValidator", () => {
  let validData: TRawJson;
  beforeEach(() => {
    validData = {
      name: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
      password: "SecurePass123!",
      phone: "+1234567890",
      role: "USER",
      metadata: {},
    };

    jest.clearAllMocks();

    // Mock RegisterDto.createFrom to return a valid DTO
    const mockDto = {
      name: "John",
      lastname: "Doe",
      email: "john.doe@example.com",
      password: "SecurePass123!",
      role: "USER",
      metadata: {},
    } as RegisterDto;

    (MockedRegisterDto.createFrom as jest.Mock).mockReturnValue([
      undefined,
      mockDto,
    ]);
  });

  describe("validate method", () => {
    describe("successful validation", () => {
      it("should validate correct data and return RegisterDto", () => {
        const dto = RegisterValidator.validate(validData);

        expect(dto).toBeDefined();
        expect(MockedRegisterDto.createFrom).toHaveBeenCalledWith({
          ...validData,
          name: "john",
          lastname: "doe",
        });
      });

      it("should convert email to lowercase", () => {
        validData.email = "JOHN.DOE@EXAMPLE.COM";

        RegisterValidator.validate(validData);

        expect(MockedRegisterDto.createFrom).toHaveBeenCalledWith(
          expect.objectContaining({
            email: "john.doe@example.com",
          }),
        );
      });

      it("should handle minimum valid lengths", () => {
        const data = {
          name: "Jo",
          lastname: "Do",
          email: "a@b.co",
          password: "Pass123!",
          phone: "+123456789",
        };

        const dto = RegisterValidator.validate(data);

        expect(dto).toBeDefined();
      });

      it("should handle maximum valid lengths", () => {
        const validData = {
          name: "A".repeat(50),
          lastname: "B".repeat(50),
          email: "test@" + "a".repeat(90) + ".com",
          password: "A".repeat(120) + "Pass123!",
          phone: "+12345678901234",
        };

        const dto = RegisterValidator.validate(validData);

        expect(dto).toBeDefined();
      });

      it("should handle all valid roles", () => {
        const roles: TUserRole[] = ["USER", "MODERATOR", "ADMIN"];

        roles.forEach((role) => {
          validData.role = role;

          const dto = RegisterValidator.validate(validData);

          expect(dto).toBeDefined();
          expect(MockedRegisterDto.createFrom).toHaveBeenCalledWith(
            expect.objectContaining({
              role,
            }),
          );
        });
      });
    });

    describe("name validation errors", () => {
      it("should throw error for name too short", () => {
        const invalidData = {
          ...validData,
          name: "J",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.NAME.MIN_LENGTH,
        );
      });

      it("should throw error for name too long", () => {
        const invalidData = {
          ...validData,
          name: "A".repeat(51),
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.NAME.MAX_LENGTH,
        );
      });

      it("should throw error for name with invalid characters", () => {
        const invalidData = {
          ...validData,
          name: "John123",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.NAME.INVALID_FORMAT,
        );
      });

      it("should throw error for missing name", () => {
        const { name, ...invalidData } = validData;

        expect(name).toBeDefined();
        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          "Invalid input: expected string, received undefined",
        );
      });
    });

    describe("lastname validation errors", () => {
      it("should throw error for lastname too short", () => {
        const invalidData = {
          ...validData,
          lastname: "D",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.LASTNAME.MIN_LENGTH,
        );
      });

      it("should throw error for lastname too long", () => {
        const invalidData = {
          ...validData,
          lastname: "B".repeat(51),
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.LASTNAME.MAX_LENGTH,
        );
      });

      it("should throw error for lastname with invalid characters", () => {
        const invalidData = {
          ...validData,
          lastname: "Doe123",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.LASTNAME.INVALID_FORMAT,
        );
      });

      it("should throw error for missing lastname", () => {
        const { lastname, ...invalidData } = validData;

        expect(lastname).toBeDefined();
        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          "Invalid input: expected string, received undefined",
        );
      });
    });

    describe("email validation errors", () => {
      it("should throw error for invalid email format", () => {
        const invalidData = {
          ...validData,
          email: "invalid-email",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.EMAIL.INVALID_FORMAT,
        );
      });

      it("should throw error for email too long", () => {
        const invalidData = {
          ...validData,
          email: "test@" + "a".repeat(250) + ".com",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.EMAIL.MAX_LENGTH,
        );
      });

      it("should throw error for missing email", () => {
        const { email, ...invalidData } = validData;

        expect(email).toBeDefined();
        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          "Must be a valid email",
        );
      });
    });

    describe("password validation errors", () => {
      it("should throw error for password too short", () => {
        const invalidData = {
          ...validData,
          password: "Pass1!",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.PASSWORD.MIN_LENGTH,
        );
      });

      it("should throw error for password too long", () => {
        const invalidData = {
          ...validData,
          password: "A".repeat(129),
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.PASSWORD.MAX_LENGTH,
        );
      });

      it("should throw error for password without uppercase", () => {
        const invalidData = {
          ...validData,
          password: "securepass123!",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.PASSWORD.INVALID_FORMAT,
        );
      });

      it("should throw error for password without lowercase", () => {
        const invalidData = {
          ...validData,
          password: "SECUREPASS123!",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.PASSWORD.INVALID_FORMAT,
        );
      });

      it("should throw error for password without numbers", () => {
        const invalidData = {
          ...validData,
          password: "SecurePass!",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.PASSWORD.INVALID_FORMAT,
        );
      });

      it("should throw error for password without special characters", () => {
        const invalidData = {
          ...validData,
          password: "SecurePass123",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.PASSWORD.INVALID_FORMAT,
        );
      });

      it("should throw error for missing password", () => {
        const { password, ...invalidData } = validData;

        expect(password).toBeDefined();
        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          "Invalid input: expected string, received undefined",
        );
      });
    });

    describe("phone validation errors", () => {
      it("should throw error for invalid phone format", () => {
        const invalidData = {
          ...validData,
          phone: "1234567890",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.PHONE.INVALID_FORMAT,
        );
      });

      it("should throw error for invalid phone format with letters", () => {
        const invalidData = {
          ...validData,
          phone: "+12345abc67890",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.PHONE.INVALID_FORMAT,
        );
      });

      it("should throw error for short phone number", () => {
        const invalidData = {
          ...validData,
          phone: "+12345678",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.PHONE.MIN_LENGTH,
        );
      });

      it("should throw error for long phone number", () => {
        const invalidData = {
          ...validData,
          phone: "+123456789012345",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow(
          VALIDATION.PHONE.MAX_LENGTH,
        );
      });
    });

    describe("metadata validation errors", () => {
      it("should throw error for invalid display_name format", () => {
        const invalidData = {
          ...validData,
          metadata: "John Doe 123",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow();
      });
    });

    describe("edge cases", () => {
      it("should throw error for null input", () => {
        expect(() => RegisterValidator.validate(null as any)).toThrow();
      });

      it("should throw error for undefined input", () => {
        expect(() => RegisterValidator.validate(undefined as any)).toThrow();
      });

      it("should throw error for empty object", () => {
        expect(() => RegisterValidator.validate({})).toThrow();
      });

      it("should throw error for non-object input", () => {
        expect(() => RegisterValidator.validate("string" as any)).toThrow();
      });
    });

    describe("DTO creation errors", () => {
      it("should throw error when RegisterDto.createFrom returns error", () => {
        const validData = {
          name: "John",
          lastname: "Doe",
          email: "john.doe@example.com",
          password: "SecurePass123!",
        };

        // Mock RegisterDto.createFrom to return an error
        (MockedRegisterDto.createFrom as jest.Mock).mockReturnValue([
          "DTO creation error",
          null,
        ]);

        expect(() => RegisterValidator.validate(validData)).toThrow(
          "DTO creation error",
        );
      });
    });

    describe("error handling edge cases", () => {
      it("should re-throw ValidationError when RegisterDto.createFrom throws ValidationError", () => {
        const validData = {
          name: "John",
          lastname: "Doe",
          email: "john.doe@example.com",
          password: "SecurePass123!",
        };

        const validationError =
          new (require("@/domain/errors/validation-error").ValidationError)(
            "Custom validation error",
          );
        (MockedRegisterDto.createFrom as jest.Mock).mockImplementation(() => {
          throw validationError;
        });

        expect(() => RegisterValidator.validate(validData)).toThrow(
          validationError,
        );
      });

      it("should re-throw BadRequestError when RegisterDto.createFrom throws BadRequestError", () => {
        const validData = {
          name: "John",
          lastname: "Doe",
          email: "john.doe@example.com",
          password: "SecurePass123!",
        };

        const badRequestError =
          new (require("@/domain/errors/bad-request-error").BadRequestError)(
            "Custom bad request error",
          );
        (MockedRegisterDto.createFrom as jest.Mock).mockImplementation(() => {
          throw badRequestError;
        });

        expect(() => RegisterValidator.validate(validData)).toThrow(
          badRequestError,
        );
      });

      it("should throw BadRequestError for unknown errors", () => {
        const validData = {
          name: "John",
          lastname: "Doe",
          email: "john.doe@example.com",
          password: "SecurePass123!",
        };

        (MockedRegisterDto.createFrom as jest.Mock).mockImplementation(() => {
          throw new Error("Unknown error type");
        });

        expect(() => RegisterValidator.validate(validData)).toThrow(
          DATA_VALIDATION.UNKNOWN_VALIDATION_ERROR,
        );
      });
    });

    describe("return type validation", () => {
      it("should throw error on validation failure", () => {
        const invalidData = {
          name: "J",
          lastname: "Doe",
          email: "john.doe@example.com",
          password: "SecurePass123!",
        };

        expect(() => RegisterValidator.validate(invalidData)).toThrow();
      });

      it("should return dto on validation success", () => {
        const validData = {
          name: "John",
          lastname: "Doe",
          email: "john.doe@example.com",
          password: "SecurePass123!",
        };

        const result = RegisterValidator.validate(validData);

        expect(result).toBeDefined();
        expect(result).toBeDefined();
      });
    });

    describe("method signature", () => {
      it("should be a static method", () => {
        expect(typeof RegisterValidator.validate).toBe("function");
        expect(RegisterValidator.validate.length).toBe(1);
      });

      it("should accept object with string keys", () => {
        const data = { test: "value" };

        expect(() => RegisterValidator.validate(data)).toThrow();
      });
    });
  });
});
