import { UpdateUser } from "@/domain/user/use-cases/update-user";
import { UpdateUserDto } from "@/domain/user/dtos/update-user.dto";
import { UserEntity } from "@/domain/user/entities/user.entity";
import { MockAuthRepository } from "@/tests/__mocks__/auth-repository.mock";

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
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "mock-session-token",
        refreshToken: "mock-refresh-token",
        email: "newemail@example.com",
        newPassword: "newPassword123",
        newPasswordConfirmation: "newPassword123",
        phone: "+1234567890",
        redirectTo: "https://example.com/redirect",
      });
      expect(error).toBeUndefined();

      const result = await updateUser.execute(updateDto!);

      expect(result).toBeInstanceOf(UserEntity);
      if (result instanceof UserEntity) {
        expect(result.email).toBe("newemail@example.com");
        expect(result.phone).toBe("+1234567890");
      }
    });

    it("should successfully update user with partial data", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "mock-session-token",
        refreshToken: "mock-refresh-token",
        email: "partialemail@example.com",
      });
      expect(error).toBeUndefined();

      const result = await updateUser.execute(updateDto!);

      expect(result).toBeInstanceOf(UserEntity);
      if (result instanceof UserEntity) {
        expect(result.email).toBe("partialemail@example.com");
      }
    });

    it("should successfully update user with only required fields", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "mock-session-token",
        refreshToken: "mock-refresh-token",
      });
      expect(error).toBeUndefined();

      const result = await updateUser.execute(updateDto!);

      expect(result).toBeInstanceOf(UserEntity);
      if (result instanceof UserEntity) {
        expect(result.email).toBe("test@example.com"); // Default from mock
        expect(result.name).toBe("Updated User");
      }
    });

    it("should call repository updateUser method with correct parameters", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "session-token-123",
        refreshToken: "refresh-token-456",
        email: "test@example.com",
        newPassword: "newPassword",
        newPasswordConfirmation: "newPassword",
        phone: "+9876543210",
      });
      expect(error).toBeUndefined();

      const repositorySpy = jest.spyOn(mockRepository, "updateUser");

      await updateUser.execute(updateDto!);

      expect(repositorySpy).toHaveBeenCalledTimes(1);
      expect(repositorySpy).toHaveBeenCalledWith(updateDto);
    });

    it("should propagate repository errors", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "mock-session-token",
        refreshToken: "mock-refresh-token",
        email: "error@example.com",
      });
      expect(error).toBeUndefined();

      mockRepository.setShouldFail(true, "Repository update failed");

      await expect(updateUser.execute(updateDto!)).rejects.toThrow(
        "Repository update failed",
      );
    });

    it("should handle different UpdateUserDto instances", async () => {
      const [error1, updateDto1] = UpdateUserDto.createFrom({
        sessionToken: "session-token-1",
        refreshToken: "refresh-token-1",
        email: "user1@example.com",
        newPassword: "password1",
        newPasswordConfirmation: "password1",
        phone: "+1111111111",
      });

      const [error2, updateDto2] = UpdateUserDto.createFrom({
        sessionToken: "session-token-2",
        refreshToken: "refresh-token-2",
        email: "user2@example.com",
        phone: "+2222222222",
      });
      expect(error1).toBeUndefined();
      expect(error2).toBeUndefined();

      const result1 = await updateUser.execute(updateDto1!);
      const result2 = await updateUser.execute(updateDto2!);

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
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "test-session-token",
        refreshToken: "test-refresh-token",
        email: "structure@example.com",
        newPassword: "newPassword123",
        newPasswordConfirmation: "newPassword123",
        phone: "+5555555555",
        redirectTo: "https://redirect.example.com",
      });
      expect(error).toBeUndefined();

      const result = await updateUser.execute(updateDto!);

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

      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "any-session-token",
        refreshToken: "any-refresh-token",
        email: "any@example.com",
      });
      expect(error).toBeUndefined();

      const result = await updateUser.execute(updateDto!);

      if (result instanceof UserEntity) {
        expect(result.id).toBe("custom-update-123");
        expect(result.email).toBe("custom-updated@example.com");
        expect(result.name).toBe("Custom Updated User");
        expect(result.phone).toBe("+9999999999");
        expect(result.email_verified).toBe(true);
      }
    });

    it("should handle password update fields correctly", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "password-session-token",
        refreshToken: "password-refresh-token",
        newPassword: "newSecurePassword123",
        newPasswordConfirmation: "newSecurePassword123",
      });
      expect(error).toBeUndefined();

      const repositorySpy = jest.spyOn(mockRepository, "updateUser");

      await updateUser.execute(updateDto!);

      expect(repositorySpy).toHaveBeenCalledWith(updateDto!);
      expect(updateDto!.newPassword).toBe("newSecurePassword123");
      expect(updateDto!.newPasswordConfirmation).toBe("newSecurePassword123");
    });

    it("should handle phone number update correctly", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "phone-session-token",
        refreshToken: "phone-refresh-token",
        phone: "+1-555-123-4567",
      });
      expect(error).toBeUndefined();

      const result = await updateUser.execute(updateDto!);

      if (result instanceof UserEntity) {
        expect(result.phone).toBe("+1-555-123-4567");
      }
    });

    it("should handle JWT-like tokens correctly", async () => {
      const jwtLikeSessionToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const jwtLikeRefreshToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.different_signature_here";

      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: jwtLikeSessionToken,
        refreshToken: jwtLikeRefreshToken,
        email: "jwt@example.com",
      });
      expect(error).toBeUndefined();

      const result = await updateUser.execute(updateDto!);

      expect(result).toBeInstanceOf(UserEntity);
      expect(updateDto!.sessionToken).toBe(jwtLikeSessionToken);
      expect(updateDto!.refreshToken).toBe(jwtLikeRefreshToken);
    });

    it("should handle empty optional fields gracefully", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "empty-session-token",
        refreshToken: "empty-refresh-token",
        email: "",
        newPassword: "",
        newPasswordConfirmation: "",
        phone: "",
        redirectionLink: "",
      });
      expect(error).toBeUndefined();

      const result = await updateUser.execute(updateDto!);

      expect(result).toBeInstanceOf(UserEntity);
      // Should not throw error with empty optional fields
    });
  });
});
