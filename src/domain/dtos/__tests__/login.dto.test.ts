import { LoginDto } from "../login.dto";
import { clearAllMocks } from "@/config/tests/test-utils";

describe("LoginDto", () => {
  afterEach(() => {
    clearAllMocks();
  });

  describe("createFrom", () => {
    it("should create LoginDto successfully with valid data", () => {
      const validData = {
        email: "john.doe@example.com",
        password: "securePassword123",
      };

      const [error, dto] = LoginDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(LoginDto);
      expect(dto?.email).toBe("john.doe@example.com");
      expect(dto?.password).toBe("securePassword123");
    });

    it("should return error when email is missing", () => {
      const invalidData = {
        password: "securePassword123",
      };

      const [error, dto] = LoginDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when password is missing", () => {
      const invalidData = {
        email: "john.doe@example.com",
      };

      const [error, dto] = LoginDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when both email and password are missing", () => {
      const invalidData = {};

      const [error, dto] = LoginDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when email is empty string", () => {
      const invalidData = {
        email: "",
        password: "securePassword123",
      };

      const [error, dto] = LoginDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when password is empty string", () => {
      const invalidData = {
        email: "john.doe@example.com",
        password: "",
      };

      const [error, dto] = LoginDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when email is null", () => {
      const invalidData = {
        email: null,
        password: "securePassword123",
      };

      const [error, dto] = LoginDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when password is null", () => {
      const invalidData = {
        email: "john.doe@example.com",
        password: null,
      };

      const [error, dto] = LoginDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when email is undefined", () => {
      const invalidData = {
        email: undefined,
        password: "securePassword123",
      };

      const [error, dto] = LoginDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when password is undefined", () => {
      const invalidData = {
        email: "john.doe@example.com",
        password: undefined,
      };

      const [error, dto] = LoginDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });
  });

  describe("constructor", () => {
    it("should create LoginDto instance with provided values", () => {
      const email = "test@example.com";
      const password = "testPassword";

      const dto = new LoginDto(email, password);

      expect(dto.email).toBe(email);
      expect(dto.password).toBe(password);
    });

    it("should freeze the instance to prevent modifications", () => {
      const dto = new LoginDto("test@example.com", "testPassword");

      expect(Object.isFrozen(dto)).toBe(true);
    });
  });
});