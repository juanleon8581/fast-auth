import { UpdateUser } from "@/domain/user/use-cases/update-user";
import { UpdateUserDto } from "@/domain/user/dtos/update-user.dto";
import { UserEntity } from "@/domain/user/entities/user.entity";
import { MockAuthRepository } from "@/config/tests/__mocks__/auth-repository.mock";

describe("UpdateUser", () => {
  let updateUser: UpdateUser;
  let mockRepository: MockAuthRepository;

  beforeEach(() => {
    mockRepository = new MockAuthRepository();
    updateUser = new UpdateUser(mockRepository);
  });

  describe("constructor", () => {
    it("should create UpdateUser instance with repository dependency", () => {
      expect(updateUser).toBeInstanceOf(UpdateUser);
      expect(updateUser).toBeDefined();
    });

    it("should store repository reference", () => {
      // Access private property for testing
      expect((updateUser as any).repository).toBe(mockRepository);
    });
  });

  describe("execute", () => {
    it("should successfully update user with valid data", async () => {
      const updateDto = new UpdateUserDto(
        "mock-session-token",
        "mock-refresh-token",
        "newemail@example.com",
        "newPassword123",
        "newPassword123",
        "+1234567890",
        "https://example.com/redirect",
      );

      const result = await updateUser.execute(updateDto);

      expect(result).toBeInstanceOf(UserEntity);
      if (result instanceof UserEntity) {
        expect(result.email).toBe("newemail@example.com");
        expect(result.phone).toBe("+1234567890");
      }
    });

    it("should successfully update user with partial data", async () => {
      const updateDto = new UpdateUserDto(
        "mock-session-token",
        "mock-refresh-token",
        "partialemail@example.com",
      );

      const result = await updateUser.execute(updateDto);

      expect(result).toBeInstanceOf(UserEntity);
      if (result instanceof UserEntity) {
        expect(result.email).toBe("partialemail@example.com");
      }
    });

    it("should successfully update user with only required fields", async () => {
      const updateDto = new UpdateUserDto(
        "mock-session-token",
        "mock-refresh-token",
      );

      const result = await updateUser.execute(updateDto);

      expect(result).toBeInstanceOf(UserEntity);
      if (result instanceof UserEntity) {
        expect(result.email).toBe("test@example.com"); // Default from mock
        expect(result.name).toBe("Updated User");
      }
    });

    it("should call repository updateUser method with correct parameters", async () => {
      const updateDto = new UpdateUserDto(
        "session-token-123",
        "refresh-token-456",
        "test@example.com",
        "newPassword",
        "newPassword",
        "+9876543210",
      );

      const repositorySpy = jest.spyOn(mockRepository, "updateUser");

      await updateUser.execute(updateDto);

      expect(repositorySpy).toHaveBeenCalledTimes(1);
      expect(repositorySpy).toHaveBeenCalledWith(updateDto);
    });

    it("should propagate repository errors", async () => {
      const updateDto = new UpdateUserDto(
        "mock-session-token",
        "mock-refresh-token",
        "error@example.com",
      );

      mockRepository.setShouldFail(true, "Repository update failed");

      await expect(updateUser.execute(updateDto)).rejects.toThrow(
        "Repository update failed",
      );
    });

    it("should handle different UpdateUserDto instances", async () => {
      const updateDto1 = new UpdateUserDto(
        "session-token-1",
        "refresh-token-1",
        "user1@example.com",
        "password1",
        "password1",
        "+1111111111",
      );

      const updateDto2 = new UpdateUserDto(
        "session-token-2",
        "refresh-token-2",
        "user2@example.com",
        undefined,
        undefined,
        "+2222222222",
      );

      const result1 = await updateUser.execute(updateDto1);
      const result2 = await updateUser.execute(updateDto2);

      expect(result1).toBeInstanceOf(UserEntity);
      expect(result2).toBeInstanceOf(UserEntity);

      if (result1 instanceof UserEntity && result2 instanceof UserEntity) {
        expect(result1.email).toBe("user1@example.com");
        expect(result1.phone).toBe("+1111111111");
        expect(result2.email).toBe("user2@example.com");
        expect(result2.phone).toBe("+2222222222");
      }
    });

    it("should return UserEntity with correct structure", async () => {
      const updateDto = new UpdateUserDto(
        "test-session-token",
        "test-refresh-token",
        "structure@example.com",
        "newPassword123",
        "newPassword123",
        "+5555555555",
        "https://redirect.example.com",
      );

      const result = await updateUser.execute(updateDto);

      expect(result).toBeInstanceOf(UserEntity);
      if (result instanceof UserEntity) {
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("email");
        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("email_verified");
        expect(result).toHaveProperty("phone");
        expect(typeof result.id).toBe("string");
        expect(typeof result.email).toBe("string");
        expect(typeof result.name).toBe("string");
        expect(typeof result.email_verified).toBe("boolean");
        expect(result.id.length).toBeGreaterThan(0);
        expect(result.email.length).toBeGreaterThan(0);
        expect(result.name.length).toBeGreaterThan(0);
      }
    });

    it("should work with custom mock result", async () => {
      const customUser = new UserEntity(
        "custom-update-123",
        "custom-updated@example.com",
        "Custom Updated User",
        true,
        "+9999999999",
      );

      mockRepository.setMockResult(customUser as any); // Cast needed for mock compatibility

      const updateDto = new UpdateUserDto(
        "any-session-token",
        "any-refresh-token",
        "any@example.com",
      );

      const result = await updateUser.execute(updateDto);

      if (result instanceof UserEntity) {
        expect(result.id).toBe("custom-update-123");
        expect(result.email).toBe("custom-updated@example.com");
        expect(result.name).toBe("Custom Updated User");
        expect(result.phone).toBe("+9999999999");
        expect(result.email_verified).toBe(true);
      }
    });

    it("should handle password update fields correctly", async () => {
      const updateDto = new UpdateUserDto(
        "password-session-token",
        "password-refresh-token",
        undefined,
        "newSecurePassword123",
        "newSecurePassword123",
      );

      const repositorySpy = jest.spyOn(mockRepository, "updateUser");

      await updateUser.execute(updateDto);

      expect(repositorySpy).toHaveBeenCalledWith(updateDto);
      expect(updateDto.newPassword).toBe("newSecurePassword123");
      expect(updateDto.newPasswordConfirmation).toBe("newSecurePassword123");
    });

    it("should handle phone number update correctly", async () => {
      const updateDto = new UpdateUserDto(
        "phone-session-token",
        "phone-refresh-token",
        undefined,
        undefined,
        undefined,
        "+1-555-123-4567",
      );

      const result = await updateUser.execute(updateDto);

      if (result instanceof UserEntity) {
        expect(result.phone).toBe("+1-555-123-4567");
      }
    });

    it("should handle JWT-like tokens correctly", async () => {
      const jwtLikeSessionToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const jwtLikeRefreshToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.different_signature_here";

      const updateDto = new UpdateUserDto(
        jwtLikeSessionToken,
        jwtLikeRefreshToken,
        "jwt@example.com",
      );

      const result = await updateUser.execute(updateDto);

      expect(result).toBeInstanceOf(UserEntity);
      expect(updateDto.sessionToken).toBe(jwtLikeSessionToken);
      expect(updateDto.refreshToken).toBe(jwtLikeRefreshToken);
    });

    it("should handle empty optional fields gracefully", async () => {
      const updateDto = new UpdateUserDto(
        "empty-session-token",
        "empty-refresh-token",
        "", // Empty email
        "", // Empty password
        "", // Empty password confirmation
        "", // Empty phone
        "", // Empty redirection link
      );

      const result = await updateUser.execute(updateDto);

      expect(result).toBeInstanceOf(UserEntity);
      // Should not throw error with empty optional fields
    });
  });
});
