import { LogoutAuth } from "../logout-user";
import { LogoutDto } from "@/domain/auth/dtos/logout.dto";
import { MockAuthRepository } from "../../../../config/tests/__mocks__/auth-repository.mock";

describe("LogoutAuth", () => {
  let logoutAuth: LogoutAuth;
  let mockRepository: MockAuthRepository;

  beforeEach(() => {
    mockRepository = new MockAuthRepository();
    logoutAuth = new LogoutAuth(mockRepository);
  });

  describe("constructor", () => {
    it("should create LogoutAuth instance with repository dependency", () => {
      expect(logoutAuth).toBeInstanceOf(LogoutAuth);
      expect(logoutAuth).toBeDefined();
    });
  });

  describe("execute", () => {
    it("should successfully logout user with valid tokens", async () => {
      const logoutDto = new LogoutDto("session-token-123", "refresh-token-456");

      await expect(logoutAuth.execute(logoutDto)).resolves.toBeUndefined();
    });

    it("should call repository logout method with correct parameters", async () => {
      const logoutDto = new LogoutDto("session-token-789", "refresh-token-012");

      const repositorySpy = jest.spyOn(mockRepository, "logout");

      await logoutAuth.execute(logoutDto);

      expect(repositorySpy).toHaveBeenCalledTimes(1);
      expect(repositorySpy).toHaveBeenCalledWith(logoutDto);
    });

    it("should propagate repository errors", async () => {
      const logoutDto = new LogoutDto("session-token-123", "refresh-token-456");

      mockRepository.setShouldFail(true, "Logout failed");

      await expect(logoutAuth.execute(logoutDto)).rejects.toThrow(
        "Logout failed",
      );
    });

    it("should handle different LogoutDto instances", async () => {
      const logoutDto1 = new LogoutDto("token-1", "refresh-1");
      const logoutDto2 = new LogoutDto("token-2", "refresh-2");

      await expect(logoutAuth.execute(logoutDto1)).resolves.toBeUndefined();
      await expect(logoutAuth.execute(logoutDto2)).resolves.toBeUndefined();
    });

    it("should handle repository errors with custom messages", async () => {
      const logoutDto = new LogoutDto("session-token-123", "refresh-token-456");

      mockRepository.setShouldFail(true, "Session expired");

      await expect(logoutAuth.execute(logoutDto)).rejects.toThrow(
        "Session expired",
      );
    });

    it("should work with valid session and refresh tokens", async () => {
      const logoutDto = new LogoutDto(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.session",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh",
      );

      const repositorySpy = jest.spyOn(mockRepository, "logout");

      await logoutAuth.execute(logoutDto);

      expect(repositorySpy).toHaveBeenCalledWith(logoutDto);
    });

    it("should reset mock state between tests", async () => {
      const logoutDto = new LogoutDto("session-token-123", "refresh-token-456");

      // First call should succeed
      await expect(logoutAuth.execute(logoutDto)).resolves.toBeUndefined();

      // Set to fail
      mockRepository.setShouldFail(true, "Test error");
      await expect(logoutAuth.execute(logoutDto)).rejects.toThrow("Test error");

      // Reset and should succeed again
      mockRepository.reset();
      await expect(logoutAuth.execute(logoutDto)).resolves.toBeUndefined();
    });
  });

  describe("interface compliance", () => {
    it("should implement LogoutAuthUseCase interface", () => {
      expect(typeof logoutAuth.execute).toBe("function");
    });

    it("should return Promise<void> from execute method", async () => {
      const logoutDto = new LogoutDto("session-token-123", "refresh-token-456");

      const result = logoutAuth.execute(logoutDto);

      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeUndefined();
    });
  });
});
