import { RequestResetPasswordEmailDto } from "../request-reset-password-email.dto";
import { clearAllMocks } from "@/tests/test-utils";

describe("RequestResetPasswordEmailDto", () => {
  afterEach(() => {
    clearAllMocks();
  });

  describe("createFrom", () => {
    it("should create RequestResetPasswordEmailDto successfully with valid data", () => {
      const validData = {
        email: "john.doe@example.com",
        redirectTo: "https://example.com/reset-password",
      };

      const [error, dto] = RequestResetPasswordEmailDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(RequestResetPasswordEmailDto);
      expect(dto?.email).toBe("john.doe@example.com");
      expect(dto?.redirectTo).toBe("https://example.com/reset-password");
    });

    it("should create RequestResetPasswordEmailDto successfully with only email", () => {
      const validData = {
        email: "john.doe@example.com",
      };

      const [error, dto] = RequestResetPasswordEmailDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(RequestResetPasswordEmailDto);
      expect(dto?.email).toBe("john.doe@example.com");
      expect(dto?.redirectTo).toBeUndefined();
    });

    it("should return error when email is missing", () => {
      const invalidData = {
        redirectTo: "https://example.com/reset-password",
      };

      const [error, dto] = RequestResetPasswordEmailDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when email is empty string", () => {
      const invalidData = {
        email: "",
        redirectTo: "https://example.com/reset-password",
      };

      const [error, dto] = RequestResetPasswordEmailDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when email is null", () => {
      const invalidData = {
        email: null,
        redirectTo: "https://example.com/reset-password",
      };

      const [error, dto] = RequestResetPasswordEmailDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when email is undefined", () => {
      const invalidData = {
        email: undefined,
        redirectTo: "https://example.com/reset-password",
      };

      const [error, dto] = RequestResetPasswordEmailDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when all fields are missing", () => {
      const invalidData = {};

      const [error, dto] = RequestResetPasswordEmailDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should handle redirectTo as undefined gracefully", () => {
      const validData = {
        email: "test@example.com",
        redirectTo: undefined,
      };

      const [error, dto] = RequestResetPasswordEmailDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(RequestResetPasswordEmailDto);
      expect(dto?.email).toBe("test@example.com");
      expect(dto?.redirectTo).toBeUndefined();
    });

    it("should handle redirectTo as null gracefully", () => {
      const validData = {
        email: "test@example.com",
        redirectTo: null,
      };

      const [error, dto] = RequestResetPasswordEmailDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(RequestResetPasswordEmailDto);
      expect(dto?.email).toBe("test@example.com");
      expect(dto?.redirectTo).toBeNull();
    });

    it("should handle empty redirectTo string gracefully", () => {
      const validData = {
        email: "test@example.com",
        redirectTo: "",
      };

      const [error, dto] = RequestResetPasswordEmailDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(RequestResetPasswordEmailDto);
      expect(dto?.email).toBe("test@example.com");
      expect(dto?.redirectTo).toBe("");
    });
  });

  describe("constructor", () => {
    it("should create instance with email and redirectTo", () => {
      const dto = new RequestResetPasswordEmailDto(
        "test@example.com",
        "https://example.com/reset",
      );

      expect(dto.email).toBe("test@example.com");
      expect(dto.redirectTo).toBe("https://example.com/reset");
    });

    it("should create instance with only email", () => {
      const dto = new RequestResetPasswordEmailDto("test@example.com");

      expect(dto.email).toBe("test@example.com");
      expect(dto.redirectTo).toBeUndefined();
    });

    it("should freeze the instance to prevent modifications", () => {
      const dto = new RequestResetPasswordEmailDto(
        "test@example.com",
        "https://example.com/reset",
      );

      expect(Object.isFrozen(dto)).toBe(true);

      // Attempt to modify should not work
      expect(() => {
        (dto as any).email = "modified@example.com";
      }).toThrow();
    });
  });

  describe("properties", () => {
    it("should have readonly email property", () => {
      const dto = new RequestResetPasswordEmailDto("test@example.com");

      expect(dto.email).toBe("test@example.com");

      // TypeScript should prevent this, but we test runtime behavior
      expect(() => {
        (dto as any).email = "new@example.com";
      }).toThrow();
    });

    it("should have readonly redirectTo property", () => {
      const dto = new RequestResetPasswordEmailDto(
        "test@example.com",
        "https://example.com/reset",
      );

      expect(dto.redirectTo).toBe("https://example.com/reset");

      // TypeScript should prevent this, but we test runtime behavior
      expect(() => {
        (dto as any).redirectTo = "https://new.com";
      }).toThrow();
    });
  });
});
