import { UpdateUserDto } from "@/domain/user/dtos/update-user.dto";
import { clearAllMocks } from "@/config/tests/test-utils";

describe("UpdateUserDto", () => {
  afterEach(() => {
    clearAllMocks();
  });

  describe("createFrom", () => {
    it("should create UpdateUserDto successfully with valid required data", () => {
      const validData = {
        sessionToken: "session-token-123",
        refreshToken: "refresh-token-456",
      };

      const [error, dto] = UpdateUserDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(UpdateUserDto);
      expect(dto?.sessionToken).toBe("session-token-123");
      expect(dto?.refreshToken).toBe("refresh-token-456");
      expect(dto?.email).toBeUndefined();
      expect(dto?.newPassword).toBeUndefined();
      expect(dto?.newPasswordConfirmation).toBeUndefined();
      expect(dto?.phone).toBeUndefined();
    });

    it("should create UpdateUserDto successfully with all optional fields", () => {
      const validData = {
        sessionToken: "session-token-123",
        refreshToken: "refresh-token-456",
        email: "new.email@example.com",
        newPassword: "NewSecurePass123!",
        newPasswordConfirmation: "NewSecurePass123!",
        phone: "+1234567890",
      };

      const [error, dto] = UpdateUserDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(UpdateUserDto);
      expect(dto?.sessionToken).toBe("session-token-123");
      expect(dto?.refreshToken).toBe("refresh-token-456");
      expect(dto?.email).toBe("new.email@example.com");
      expect(dto?.newPassword).toBe("NewSecurePass123!");
      expect(dto?.newPasswordConfirmation).toBe("NewSecurePass123!");
      expect(dto?.phone).toBe("+1234567890");
    });

    it("should create UpdateUserDto with partial optional fields", () => {
      const validData = {
        sessionToken: "session-token-123",
        refreshToken: "refresh-token-456",
        email: "new.email@example.com",
        phone: "+1234567890",
      };

      const [error, dto] = UpdateUserDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(UpdateUserDto);
      expect(dto?.sessionToken).toBe("session-token-123");
      expect(dto?.refreshToken).toBe("refresh-token-456");
      expect(dto?.email).toBe("new.email@example.com");
      expect(dto?.phone).toBe("+1234567890");
      expect(dto?.newPassword).toBeUndefined();
      expect(dto?.newPasswordConfirmation).toBeUndefined();
    });

    it("should return error when sessionToken is missing", () => {
      const invalidData = {
        refreshToken: "refresh-token-456",
        email: "new.email@example.com",
      };

      const [error, dto] = UpdateUserDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when refreshToken is missing", () => {
      const invalidData = {
        sessionToken: "session-token-123",
        email: "new.email@example.com",
      };

      const [error, dto] = UpdateUserDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when both required tokens are missing", () => {
      const invalidData = {
        email: "new.email@example.com",
        phone: "+1234567890",
      };

      const [error, dto] = UpdateUserDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when all fields are missing", () => {
      const invalidData = {};

      const [error, dto] = UpdateUserDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when sessionToken is empty string", () => {
      const invalidData = {
        sessionToken: "",
        refreshToken: "refresh-token-456",
      };

      const [error, dto] = UpdateUserDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when refreshToken is empty string", () => {
      const invalidData = {
        sessionToken: "session-token-123",
        refreshToken: "",
      };

      const [error, dto] = UpdateUserDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when both tokens are empty strings", () => {
      const invalidData = {
        sessionToken: "",
        refreshToken: "",
        email: "new.email@example.com",
      };

      const [error, dto] = UpdateUserDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when sessionToken is null", () => {
      const invalidData = {
        sessionToken: null,
        refreshToken: "refresh-token-456",
      };

      const [error, dto] = UpdateUserDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when refreshToken is null", () => {
      const invalidData = {
        sessionToken: "session-token-123",
        refreshToken: null,
      };

      const [error, dto] = UpdateUserDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when both tokens are null", () => {
      const invalidData = {
        sessionToken: null,
        refreshToken: null,
        email: "new.email@example.com",
      };

      const [error, dto] = UpdateUserDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when sessionToken is undefined", () => {
      const invalidData = {
        sessionToken: undefined,
        refreshToken: "refresh-token-456",
      };

      const [error, dto] = UpdateUserDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when refreshToken is undefined", () => {
      const invalidData = {
        sessionToken: "session-token-123",
        refreshToken: undefined,
      };

      const [error, dto] = UpdateUserDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when both tokens are undefined", () => {
      const invalidData = {
        sessionToken: undefined,
        refreshToken: undefined,
        email: "new.email@example.com",
      };

      const [error, dto] = UpdateUserDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should handle extra properties in input data", () => {
      const dataWithExtraProps = {
        sessionToken: "session-token-123",
        refreshToken: "refresh-token-456",
        email: "new.email@example.com",
        extraField: "should be ignored",
        anotherField: 123,
        booleanField: true,
      };

      const [error, dto] = UpdateUserDto.createFrom(dataWithExtraProps);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(UpdateUserDto);
      expect(dto?.sessionToken).toBe("session-token-123");
      expect(dto?.refreshToken).toBe("refresh-token-456");
      expect(dto?.email).toBe("new.email@example.com");
      // Extra properties should not be included
      expect((dto as any)?.extraField).toBeUndefined();
      expect((dto as any)?.anotherField).toBeUndefined();
      expect((dto as any)?.booleanField).toBeUndefined();
    });

    it("should handle JWT-like tokens", () => {
      const validData = {
        sessionToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.session-payload.signature",
        refreshToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-payload.signature",
        email: "user@example.com",
      };

      const [error, dto] = UpdateUserDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(UpdateUserDto);
      expect(dto?.sessionToken).toBe(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.session-payload.signature",
      );
      expect(dto?.refreshToken).toBe(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-payload.signature",
      );
      expect(dto?.email).toBe("user@example.com");
    });

    it("should handle password update fields", () => {
      const validData = {
        sessionToken: "session-token-123",
        refreshToken: "refresh-token-456",
        newPassword: "NewSecurePass123!",
        newPasswordConfirmation: "NewSecurePass123!",
      };

      const [error, dto] = UpdateUserDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(UpdateUserDto);
      expect(dto?.newPassword).toBe("NewSecurePass123!");
      expect(dto?.newPasswordConfirmation).toBe("NewSecurePass123!");
    });

    it("should handle phone number update", () => {
      const validData = {
        sessionToken: "session-token-123",
        refreshToken: "refresh-token-456",
        phone: "+1-555-123-4567",
      };

      const [error, dto] = UpdateUserDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(UpdateUserDto);
      expect(dto?.phone).toBe("+1-555-123-4567");
    });

    it("should handle empty optional fields gracefully", () => {
      const validData = {
        sessionToken: "session-token-123",
        refreshToken: "refresh-token-456",
        email: "",
        newPassword: "",
        phone: "",
      };

      const [error, dto] = UpdateUserDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(UpdateUserDto);
      expect(dto?.email).toBe("");
      expect(dto?.newPassword).toBe("");
      expect(dto?.phone).toBe("");
    });
  });

  describe("constructor", () => {
    it("should create UpdateUserDto instance with readonly properties", () => {
      const dto = new UpdateUserDto(
        "session-token-123",
        "refresh-token-456",
        "new.email@example.com",
        "NewPassword123!",
        "NewPassword123!",
        "+1234567890",
      );

      expect(dto.sessionToken).toBe("session-token-123");
      expect(dto.refreshToken).toBe("refresh-token-456");
      expect(dto.email).toBe("new.email@example.com");
      expect(dto.newPassword).toBe("NewPassword123!");
      expect(dto.newPasswordConfirmation).toBe("NewPassword123!");
      expect(dto.phone).toBe("+1234567890");
    });

    it("should create UpdateUserDto instance with only required fields", () => {
      const dto = new UpdateUserDto("session-token-123", "refresh-token-456");

      expect(dto.sessionToken).toBe("session-token-123");
      expect(dto.refreshToken).toBe("refresh-token-456");
      expect(dto.email).toBeUndefined();
      expect(dto.newPassword).toBeUndefined();
      expect(dto.newPasswordConfirmation).toBeUndefined();
      expect(dto.phone).toBeUndefined();
    });

    it("should create UpdateUserDto instance with partial optional fields", () => {
      const dto = new UpdateUserDto(
        "session-token-123",
        "refresh-token-456",
        "new.email@example.com",
        undefined,
        undefined,
        "+1234567890",
      );

      expect(dto.sessionToken).toBe("session-token-123");
      expect(dto.refreshToken).toBe("refresh-token-456");
      expect(dto.email).toBe("new.email@example.com");
      expect(dto.newPassword).toBeUndefined();
      expect(dto.newPasswordConfirmation).toBeUndefined();
      expect(dto.phone).toBe("+1234567890");
    });

    it("should freeze the instance to prevent modifications", () => {
      const dto = new UpdateUserDto(
        "session-token-123",
        "refresh-token-456",
        "email@example.com",
      );

      expect(Object.isFrozen(dto)).toBe(true);

      // Attempting to modify should not work
      expect(() => {
        (dto as any).sessionToken = "modified-token";
      }).toThrow();
    });
  });

  describe("interface compliance", () => {
    it("should have all required properties defined", () => {
      const dto = new UpdateUserDto("session-token-123", "refresh-token-456");

      expect(dto).toHaveProperty("sessionToken");
      expect(dto).toHaveProperty("refreshToken");
      expect(dto).toHaveProperty("email");
      expect(dto).toHaveProperty("newPassword");
      expect(dto).toHaveProperty("newPasswordConfirmation");
      expect(dto).toHaveProperty("phone");
    });

    it("should implement readonly properties correctly", () => {
      const dto = new UpdateUserDto(
        "session-token-123",
        "refresh-token-456",
        "email@example.com",
      );

      // TypeScript readonly properties should be accessible
      expect(typeof dto.sessionToken).toBe("string");
      expect(typeof dto.refreshToken).toBe("string");
      expect(typeof dto.email).toBe("string");
    });
  });

  describe("edge cases", () => {
    it("should handle very long token values", () => {
      const longToken = "a".repeat(1000);
      const validData = {
        sessionToken: longToken,
        refreshToken: longToken,
      };

      const [error, dto] = UpdateUserDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(UpdateUserDto);
      expect(dto?.sessionToken).toBe(longToken);
      expect(dto?.refreshToken).toBe(longToken);
    });

    it("should handle special characters in optional fields", () => {
      const validData = {
        sessionToken: "session-token-123",
        refreshToken: "refresh-token-456",
        email: "user+test@example.com",
        phone: "+1 (555) 123-4567 ext. 890",
      };

      const [error, dto] = UpdateUserDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(UpdateUserDto);
      expect(dto?.email).toBe("user+test@example.com");
      expect(dto?.phone).toBe("+1 (555) 123-4567 ext. 890");
    });

    it("should handle unicode characters in optional fields", () => {
      const validData = {
        sessionToken: "session-token-123",
        refreshToken: "refresh-token-456",
        email: "usuario@ejemplo.com",
        phone: "📞 +1234567890",
      };

      const [error, dto] = UpdateUserDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(UpdateUserDto);
      expect(dto?.email).toBe("usuario@ejemplo.com");
      expect(dto?.phone).toBe("📞 +1234567890");
    });
  });
});
