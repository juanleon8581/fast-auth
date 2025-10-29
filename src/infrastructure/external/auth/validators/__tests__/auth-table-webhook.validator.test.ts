import { AuthTableWebhookValidator } from "../auth-table-webhook.validator";
import { SyncUserFromAuthDto } from "@/domain/user/dtos/sync-user-from-auth.dto";
import { ValidationError } from "@/domain/errors/validation-error";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";

describe("AuthTableWebhookValidator", () => {
  const validUuid = "a3cbd592-22df-4b62-9f6a-5c2fa2f9e1b9";

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("validate", () => {
    it("should validate correct record and return SyncUserFromAuthDto", () => {
      const data = {
        record: {
          id: validUuid,
          email: "user@example.com",
          raw_user_meta_data: {
            display_name: "John Doe",
            email_verified: true,
          },
          phone: "+1234567890",
        },
      };

      const spy = jest.spyOn(SyncUserFromAuthDto, "createFrom");
      const result = AuthTableWebhookValidator.validate(data as any);

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: validUuid,
          email: "user@example.com",
          name: "John Doe",
          email_verified: true,
          phone: "+1234567890",
        }),
      );
      expect(result).toBeInstanceOf(SyncUserFromAuthDto);
      expect(result.id).toBe(validUuid);
      expect(result.email).toBe("user@example.com");
      expect(result.name).toBe("John Doe");
      expect(result.email_verified).toBe(true);
      expect(result.phone).toBe("+1234567890");
    });

    it("should throw ValidationError when record is missing", () => {
      const data = {};

      expect(() => AuthTableWebhookValidator.validate(data as any)).toThrow(
        ValidationError,
      );
      expect(() => AuthTableWebhookValidator.validate(data as any)).toThrow(
        ERROR_MESSAGES.DATA_VALIDATION.INVALID_WEBHOOK_DATA,
      );
    });

    it("should throw ValidationError when email is invalid", () => {
      const data = {
        record: {
          id: validUuid,
          email: "invalid-email",
          raw_user_meta_data: {
            display_name: "John Doe",
            email_verified: true,
          },
          phone: "+1234567890",
        },
      };

      try {
        AuthTableWebhookValidator.validate(data as any);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const err = error as ValidationError;
        expect(err.field).toBe("email");
        expect(err.code).toBe("VALIDATION_ERROR");
        expect(err.message).toMatch(/Invalid email/i);
      }
    });

    it("should throw ValidationError when id is not a uuid", () => {
      const data = {
        record: {
          id: "not-a-uuid",
          email: "user@example.com",
          raw_user_meta_data: {
            display_name: "John Doe",
            email_verified: true,
          },
          phone: "+1234567890",
        },
      };

      try {
        AuthTableWebhookValidator.validate(data as any);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const err = error as ValidationError;
        expect(err.field).toBe("id");
        expect(err.code).toBe("VALIDATION_ERROR");
        expect(err.message).toMatch(/Invalid uuid/i);
      }
    });

    it("should throw ValidationError when email_verified has invalid type", () => {
      const data = {
        record: {
          id: validUuid,
          email: "user@example.com",
          raw_user_meta_data: {
            display_name: "John Doe",
            email_verified: "yes" as any,
          },
          phone: "+1234567890",
        },
      };

      try {
        AuthTableWebhookValidator.validate(data as any);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const err = error as ValidationError;
        expect(err.field).toBe("email_verified");
        expect(err.code).toBe("VALIDATION_ERROR");
        expect(err.message).toMatch(/boolean/i);
      }
    });

    it("should validate when phone is missing (optional field)", () => {
      const data = {
        record: {
          id: validUuid,
          email: "user@example.com",
          raw_user_meta_data: {
            display_name: "John Doe",
            email_verified: true,
          },
          // phone missing
        } as any,
      };

      const result = AuthTableWebhookValidator.validate(data as any);
      expect(result).toBeInstanceOf(SyncUserFromAuthDto);
      expect(result.phone).toBeUndefined();
    });

    it("should throw ValidationError when raw_user_meta_data is missing", () => {
      const data = {
        record: {
          id: validUuid,
          email: "user@example.com",
          // raw_user_meta_data missing
        } as any,
      };

      expect(() => AuthTableWebhookValidator.validate(data as any)).toThrow(
        ValidationError,
      );
      expect(() => AuthTableWebhookValidator.validate(data as any)).toThrow(
        ERROR_MESSAGES.DATA_VALIDATION.INVALID_WEBHOOK_DATA,
      );
    });

    it("should throw ValidationError when DTO factory returns domain error", () => {
      const data = {
        record: {
          id: validUuid,
          email: "user@example.com",
          raw_user_meta_data: {
            display_name: "John Doe",
            email_verified: true,
          },
          phone: "+1234567890",
        },
      };

      const mockError = ERROR_MESSAGES.DATA_VALIDATION.INVALID_DATA;
      jest
        .spyOn(SyncUserFromAuthDto, "createFrom")
        .mockReturnValue([mockError, undefined]);

      expect(() => AuthTableWebhookValidator.validate(data as any)).toThrow(
        ValidationError,
      );
      expect(() => AuthTableWebhookValidator.validate(data as any)).toThrow(
        mockError,
      );
    });
  });
});