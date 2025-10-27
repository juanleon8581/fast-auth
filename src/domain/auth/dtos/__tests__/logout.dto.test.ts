import { LogoutDto } from "../logout.dto";
import { clearAllMocks } from "@/tests/test-utils";

describe("LogoutDto", () => {
  afterEach(() => {
    clearAllMocks();
  });

  describe("createFrom", () => {
    it("should create LogoutDto successfully with valid data", () => {
      const validData = {
        sessionToken: "valid-session-token-123",
        refreshToken: "valid-refresh-token-456",
      };

      const [error, dto] = LogoutDto.createFrom(validData);

      expect(error).toBeUndefined();
      expect(dto).toBeInstanceOf(LogoutDto);
      expect(dto?.sessionToken).toBe("valid-session-token-123");
      expect(dto?.refreshToken).toBe("valid-refresh-token-456");
    });

    it("should return error when sessionToken is missing", () => {
      const invalidData = {
        refreshToken: "valid-refresh-token-456",
      };

      const [error, dto] = LogoutDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when refreshToken is missing", () => {
      const invalidData = {
        sessionToken: "valid-session-token-123",
      };

      const [error, dto] = LogoutDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when both sessionToken and refreshToken are missing", () => {
      const invalidData = {};

      const [error, dto] = LogoutDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when sessionToken is empty string", () => {
      const invalidData = {
        sessionToken: "",
        refreshToken: "valid-refresh-token-456",
      };

      const [error, dto] = LogoutDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when refreshToken is empty string", () => {
      const invalidData = {
        sessionToken: "valid-session-token-123",
        refreshToken: "",
      };

      const [error, dto] = LogoutDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when sessionToken is null", () => {
      const invalidData = {
        sessionToken: null,
        refreshToken: "valid-refresh-token-456",
      };

      const [error, dto] = LogoutDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when refreshToken is null", () => {
      const invalidData = {
        sessionToken: "valid-session-token-123",
        refreshToken: null,
      };

      const [error, dto] = LogoutDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when sessionToken is undefined", () => {
      const invalidData = {
        sessionToken: undefined,
        refreshToken: "valid-refresh-token-456",
      };

      const [error, dto] = LogoutDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });

    it("should return error when refreshToken is undefined", () => {
      const invalidData = {
        sessionToken: "valid-session-token-123",
        refreshToken: undefined,
      };

      const [error, dto] = LogoutDto.createFrom(invalidData);

      expect(error).toBeDefined();
      expect(dto).toBeUndefined();
    });
  });

  describe("constructor", () => {
    it("should create LogoutDto instance with provided values", () => {
      const sessionToken = "test-session-token";
      const refreshToken = "test-refresh-token";

      const dto = new LogoutDto(sessionToken, refreshToken);

      expect(dto.sessionToken).toBe(sessionToken);
      expect(dto.refreshToken).toBe(refreshToken);
    });

    it("should freeze the instance to prevent modifications", () => {
      const dto = new LogoutDto("test-session-token", "test-refresh-token");

      expect(Object.isFrozen(dto)).toBe(true);
    });
  });
});
