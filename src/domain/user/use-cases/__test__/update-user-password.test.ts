import { UpdateUserPassword } from "@/domain/user/use-cases/update-user-password";
import { UpdateUserDto } from "@/domain/user/dtos/update-user.dto";
import { UserEntity } from "@/domain/user/entities/user.entity";
import { AuthUserEntity } from "@/domain/auth/entities/auth-user.entity";
import { MockAuthRepository } from "@/tests/__mocks__/auth-repository.mock";

describe("UpdateUserPassword", () => {
  let updateUserPassword: UpdateUserPassword;
  let mockRepository: MockAuthRepository;

  beforeEach(() => {
    mockRepository = new MockAuthRepository();
    updateUserPassword = new UpdateUserPassword(mockRepository);
  });

  describe("constructor", () => {
    it("should create UpdateUserPassword instance with repository dependency", () => {
      expect(updateUserPassword).toBeInstanceOf(UpdateUserPassword);
      expect(updateUserPassword).toBeDefined();
    });

    it("should store repository reference", () => {
      // Access private property for testing
      expect((updateUserPassword as any).repository).toBe(mockRepository);
    });
  });

  describe("execute", () => {
    it("should successfully update user password with valid data", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "mock-session-token",
        refreshToken: "mock-refresh-token",
        newPassword: "newSecurePassword123",
        newPasswordConfirmation: "newSecurePassword123",
      });
      expect(error).toBeUndefined();

      const result = await updateUserPassword.execute(updateDto!);

      expect(result).toBeInstanceOf(AuthUserEntity);
      if (result instanceof AuthUserEntity) {
        expect(result.user.email).toBe("test@example.com"); // Default from mock
        expect(result.user.name).toBe("Updated User");
      }
    });

    it("should successfully update password with confirmation", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "session-token-123",
        refreshToken: "refresh-token-456",
        newPassword: "strongPassword456",
        newPasswordConfirmation: "strongPassword456",
      });
      expect(error).toBeUndefined();

      const result = await updateUserPassword.execute(updateDto!);

      expect(result).toBeInstanceOf(AuthUserEntity);
      if (result instanceof AuthUserEntity) {
        expect(result.user.email).toBe("test@example.com");
        expect(result.user.name).toBe("Updated User");
      }
    });

    it("should call repository updateUserPassword method with correct parameters", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "session-token-789",
        refreshToken: "refresh-token-012",
        newPassword: "testPassword789",
        newPasswordConfirmation: "testPassword789",
      });
      expect(error).toBeUndefined();

      const repositorySpy = jest.spyOn(mockRepository, "updateUserPassword");

      await updateUserPassword.execute(updateDto!);

      expect(repositorySpy).toHaveBeenCalledTimes(1);
      expect(repositorySpy).toHaveBeenCalledWith(updateDto);
    });

    it("should propagate repository errors", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "mock-session-token",
        refreshToken: "mock-refresh-token",
        newPassword: "errorPassword123",
        newPasswordConfirmation: "errorPassword123",
      });
      expect(error).toBeUndefined();

      mockRepository.setShouldFail(true, "Password update failed");

      await expect(updateUserPassword.execute(updateDto!)).rejects.toThrow(
        "Password update failed",
      );
    });

    it("should handle different UpdateUserDto instances for password updates", async () => {
      const [error1, updateDto1] = UpdateUserDto.createFrom({
        sessionToken: "session-token-1",
        refreshToken: "refresh-token-1",
        newPassword: "password1",
        newPasswordConfirmation: "password1",
      });

      const [error2, updateDto2] = UpdateUserDto.createFrom({
        sessionToken: "session-token-2",
        refreshToken: "refresh-token-2",
        newPassword: "password2",
        newPasswordConfirmation: "password2",
      });
      expect(error1).toBeUndefined();
      expect(error2).toBeUndefined();

      const result1 = await updateUserPassword.execute(updateDto1!);
      const result2 = await updateUserPassword.execute(updateDto2!);

      expect(result1).toBeInstanceOf(AuthUserEntity);
      expect(result2).toBeInstanceOf(AuthUserEntity);

      if (
        result1 instanceof AuthUserEntity &&
        result2 instanceof AuthUserEntity
      ) {
        expect(result1.user.email).toBe("test@example.com");
        expect(result2.user.email).toBe("test@example.com");
        expect(result1.user.name).toBe("Updated User");
        expect(result2.user.name).toBe("Updated User");
      }
    });

    it("should return UserEntity with correct structure", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "test-session-token",
        refreshToken: "test-refresh-token",
        newPassword: "structurePassword123",
        newPasswordConfirmation: "structurePassword123",
      });
      expect(error).toBeUndefined();

      const result = await updateUserPassword.execute(updateDto!);

      expect(result).toBeInstanceOf(AuthUserEntity);
      if (result instanceof AuthUserEntity) {
        expect(result).toHaveProperty("user");
        expect(result).toHaveProperty("accessToken");
        expect(result).toHaveProperty("refreshToken");
        expect(result.user).toHaveProperty("id");
        expect(result.user).toHaveProperty("email");
        expect(result.user).toHaveProperty("name");
        expect(result.user).toHaveProperty("email_verified");
        expect(result.user).toHaveProperty("phone");
        expect(typeof result.user.id).toBe("string");
        expect(typeof result.user.email).toBe("string");
        expect(typeof result.user.name).toBe("string");
        expect(typeof result.user.email_verified).toBe("boolean");
        expect(result.user.id.length).toBeGreaterThan(0);
        expect(result.user.email.length).toBeGreaterThan(0);
        expect(result.user.name.length).toBeGreaterThan(0);
      }
    });

    it("should work with custom mock result", async () => {
      const customUser = new UserEntity(
        "custom-password-123",
        "custom-password@example.com",
        "Custom Password User",
        true,
        "+9999999999",
      );

      const customAuthData = {
        user: customUser,
        data: {
          access_token: "custom-access-token",
          refresh_token: "custom-refresh-token",
        },
      };

      const customAuthUser = AuthUserEntity.createFrom(customAuthData);
      mockRepository.setMockResult(customAuthUser);

      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "any-session-token",
        refreshToken: "any-refresh-token",
        newPassword: "anyPassword123",
        newPasswordConfirmation: "anyPassword123",
      });
      expect(error).toBeUndefined();

      const result = await updateUserPassword.execute(updateDto!);

      if (result instanceof AuthUserEntity) {
        expect(result.user.id).toBe("custom-password-123");
        expect(result.user.email).toBe("custom-password@example.com");
        expect(result.user.name).toBe("Custom Password User");
        expect(result.user.phone).toBe("+9999999999");
        expect(result.user.email_verified).toBe(true);
      }
    });

    it("should handle password fields correctly", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "password-session-token",
        refreshToken: "password-refresh-token",
        newPassword: "newSecurePassword123",
        newPasswordConfirmation: "newSecurePassword123",
      });
      expect(error).toBeUndefined();

      const repositorySpy = jest.spyOn(mockRepository, "updateUserPassword");

      await updateUserPassword.execute(updateDto!);

      expect(repositorySpy).toHaveBeenCalledWith(updateDto!);
      expect(updateDto!.newPassword).toBe("newSecurePassword123");
      expect(updateDto!.newPasswordConfirmation).toBe("newSecurePassword123");
    });

    it("should handle JWT-like tokens correctly", async () => {
      const jwtLikeSessionToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const jwtLikeRefreshToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.different_signature_here";

      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: jwtLikeSessionToken,
        refreshToken: jwtLikeRefreshToken,
        newPassword: "jwtPassword123",
        newPasswordConfirmation: "jwtPassword123",
      });
      expect(error).toBeUndefined();

      const result = await updateUserPassword.execute(updateDto!);

      expect(result).toBeInstanceOf(AuthUserEntity);
      expect(updateDto!.sessionToken).toBe(jwtLikeSessionToken);
      expect(updateDto!.refreshToken).toBe(jwtLikeRefreshToken);
    });

    it("should handle strong password requirements", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "strong-session-token",
        refreshToken: "strong-refresh-token",
        newPassword: "VeryStrongP@ssw0rd!2023",
        newPasswordConfirmation: "VeryStrongP@ssw0rd!2023",
      });
      expect(error).toBeUndefined();

      const result = await updateUserPassword.execute(updateDto!);

      expect(result).toBeInstanceOf(AuthUserEntity);
      expect(updateDto!.newPassword).toBe("VeryStrongP@ssw0rd!2023");
      expect(updateDto!.newPasswordConfirmation).toBe("VeryStrongP@ssw0rd!2023");
    });

    it("should handle password update without other fields", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "password-only-session",
        refreshToken: "password-only-refresh",
        newPassword: "onlyPasswordUpdate123",
        newPasswordConfirmation: "onlyPasswordUpdate123",
      });
      expect(error).toBeUndefined();

      const repositorySpy = jest.spyOn(mockRepository, "updateUserPassword");

      await updateUserPassword.execute(updateDto!);

      expect(repositorySpy).toHaveBeenCalledWith(updateDto!);
      expect(updateDto!.email).toBeUndefined();
      expect(updateDto!.phone).toBeUndefined();
      expect(updateDto!.newPassword).toBe("onlyPasswordUpdate123");
      expect(updateDto!.newPasswordConfirmation).toBe("onlyPasswordUpdate123");
    });
  });

  describe("interface compliance", () => {
    it("should implement IUpdateUserPasswordUseCase interface", () => {
      expect(typeof updateUserPassword.execute).toBe("function");
    });

    it("should return Promise<UserEntity | AuthUserEntity> from execute method", async () => {
      const [error, updateDto] = UpdateUserDto.createFrom({
        sessionToken: "interface-session-token",
        refreshToken: "interface-refresh-token",
        newPassword: "interfacePassword123",
        newPasswordConfirmation: "interfacePassword123",
      });
      expect(error).toBeUndefined();

      const result = updateUserPassword.execute(updateDto!);

      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeInstanceOf(AuthUserEntity);
    });
  });
});
