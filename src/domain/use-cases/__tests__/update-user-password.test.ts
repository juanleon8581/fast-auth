import { UpdateUserPassword } from "../update-user-password";
import { UpdateUserDto } from "../../dtos/update-user.dto";
import { UserEntity } from "../../entities/user.entity";
import { AuthUserEntity } from "../../entities/auth-user.entity";
import { MockAuthRepository } from "../../../config/__tests__/mocks/auth-repository.mock";

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
      const updateDto = new UpdateUserDto(
        "mock-session-token",
        "mock-refresh-token",
        undefined,
        "newSecurePassword123",
        "newSecurePassword123",
      );

      const result = await updateUserPassword.execute(updateDto);

      expect(result).toBeInstanceOf(AuthUserEntity);
      if (result instanceof AuthUserEntity) {
        expect(result.user.email).toBe("test@example.com"); // Default from mock
        expect(result.user.name).toBe("Updated User");
      }
    });

    it("should successfully update password with confirmation", async () => {
      const updateDto = new UpdateUserDto(
        "session-token-123",
        "refresh-token-456",
        undefined,
        "strongPassword456",
        "strongPassword456",
      );

      const result = await updateUserPassword.execute(updateDto);

      expect(result).toBeInstanceOf(AuthUserEntity);
      if (result instanceof AuthUserEntity) {
        expect(result.user.email).toBe("test@example.com");
        expect(result.user.name).toBe("Updated User");
      }
    });

    it("should call repository updateUserPassword method with correct parameters", async () => {
      const updateDto = new UpdateUserDto(
        "session-token-789",
        "refresh-token-012",
        undefined,
        "testPassword789",
        "testPassword789",
      );

      const repositorySpy = jest.spyOn(mockRepository, "updateUserPassword");

      await updateUserPassword.execute(updateDto);

      expect(repositorySpy).toHaveBeenCalledTimes(1);
      expect(repositorySpy).toHaveBeenCalledWith(updateDto);
    });

    it("should propagate repository errors", async () => {
      const updateDto = new UpdateUserDto(
        "mock-session-token",
        "mock-refresh-token",
        undefined,
        "errorPassword123",
        "errorPassword123",
      );

      mockRepository.setShouldFail(true, "Password update failed");

      await expect(updateUserPassword.execute(updateDto)).rejects.toThrow(
        "Password update failed",
      );
    });

    it("should handle different UpdateUserDto instances for password updates", async () => {
      const updateDto1 = new UpdateUserDto(
        "session-token-1",
        "refresh-token-1",
        undefined,
        "password1",
        "password1",
      );

      const updateDto2 = new UpdateUserDto(
        "session-token-2",
        "refresh-token-2",
        undefined,
        "password2",
        "password2",
      );

      const result1 = await updateUserPassword.execute(updateDto1);
      const result2 = await updateUserPassword.execute(updateDto2);

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
      const updateDto = new UpdateUserDto(
        "test-session-token",
        "test-refresh-token",
        undefined,
        "structurePassword123",
        "structurePassword123",
      );

      const result = await updateUserPassword.execute(updateDto);

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

      const updateDto = new UpdateUserDto(
        "any-session-token",
        "any-refresh-token",
        undefined,
        "anyPassword123",
        "anyPassword123",
      );

      const result = await updateUserPassword.execute(updateDto);

      if (result instanceof AuthUserEntity) {
        expect(result.user.id).toBe("custom-password-123");
        expect(result.user.email).toBe("custom-password@example.com");
        expect(result.user.name).toBe("Custom Password User");
        expect(result.user.phone).toBe("+9999999999");
        expect(result.user.email_verified).toBe(true);
      }
    });

    it("should handle password fields correctly", async () => {
      const updateDto = new UpdateUserDto(
        "password-session-token",
        "password-refresh-token",
        undefined,
        "newSecurePassword123",
        "newSecurePassword123",
      );

      const repositorySpy = jest.spyOn(mockRepository, "updateUserPassword");

      await updateUserPassword.execute(updateDto);

      expect(repositorySpy).toHaveBeenCalledWith(updateDto);
      expect(updateDto.newPassword).toBe("newSecurePassword123");
      expect(updateDto.newPasswordConfirmation).toBe("newSecurePassword123");
    });

    it("should handle JWT-like tokens correctly", async () => {
      const jwtLikeSessionToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const jwtLikeRefreshToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.different_signature_here";

      const updateDto = new UpdateUserDto(
        jwtLikeSessionToken,
        jwtLikeRefreshToken,
        undefined,
        "jwtPassword123",
        "jwtPassword123",
      );

      const result = await updateUserPassword.execute(updateDto);

      expect(result).toBeInstanceOf(AuthUserEntity);
      expect(updateDto.sessionToken).toBe(jwtLikeSessionToken);
      expect(updateDto.refreshToken).toBe(jwtLikeRefreshToken);
    });

    it("should handle strong password requirements", async () => {
      const updateDto = new UpdateUserDto(
        "strong-session-token",
        "strong-refresh-token",
        undefined,
        "VeryStrongP@ssw0rd!2023",
        "VeryStrongP@ssw0rd!2023",
      );

      const result = await updateUserPassword.execute(updateDto);

      expect(result).toBeInstanceOf(AuthUserEntity);
      expect(updateDto.newPassword).toBe("VeryStrongP@ssw0rd!2023");
      expect(updateDto.newPasswordConfirmation).toBe("VeryStrongP@ssw0rd!2023");
    });

    it("should handle password update without other fields", async () => {
      const updateDto = new UpdateUserDto(
        "password-only-session",
        "password-only-refresh",
        undefined, // no email
        "onlyPasswordUpdate123",
        "onlyPasswordUpdate123",
        undefined, // no phone
        undefined, // no redirection link
      );

      const repositorySpy = jest.spyOn(mockRepository, "updateUserPassword");

      await updateUserPassword.execute(updateDto);

      expect(repositorySpy).toHaveBeenCalledWith(updateDto);
      expect(updateDto.email).toBeUndefined();
      expect(updateDto.phone).toBeUndefined();
      expect(updateDto.redirectionLink).toBeUndefined();
      expect(updateDto.newPassword).toBe("onlyPasswordUpdate123");
      expect(updateDto.newPasswordConfirmation).toBe("onlyPasswordUpdate123");
    });
  });

  describe("interface compliance", () => {
    it("should implement IUpdateUserPasswordUseCase interface", () => {
      expect(typeof updateUserPassword.execute).toBe("function");
    });

    it("should return Promise<UserEntity | AuthUserEntity> from execute method", async () => {
      const updateDto = new UpdateUserDto(
        "interface-session-token",
        "interface-refresh-token",
        undefined,
        "interfacePassword123",
        "interfacePassword123",
      );

      const result = updateUserPassword.execute(updateDto);

      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeInstanceOf(AuthUserEntity);
    });
  });
});
