import { LoginUser } from "../login-user";
import { LoginDto } from "@/domain/dtos/login.dto";
import { AuthUserEntity } from "@/domain/entities/auth-user.entity";
import { UserEntity } from "@/domain/entities/user.entity";
import { MockAuthRepository } from "../../../config/__tests__/mocks/auth-repository.mock";

describe("LoginUser", () => {
  let loginUser: LoginUser;
  let mockRepository: MockAuthRepository;

  beforeEach(() => {
    mockRepository = new MockAuthRepository();
    loginUser = new LoginUser(mockRepository);
  });

  describe("constructor", () => {
    it("should create LoginUser instance with repository dependency", () => {
      expect(loginUser).toBeInstanceOf(LoginUser);
      expect(loginUser).toBeDefined();
    });
  });

  describe("execute", () => {
    it("should successfully login user with valid credentials", async () => {
      const loginDto = new LoginDto("john@example.com", "password123");

      const result = await loginUser.execute(loginDto);

      expect(result).toBeInstanceOf(AuthUserEntity);
      if (result instanceof AuthUserEntity) {
        expect(result.user).toBeInstanceOf(UserEntity);
        expect(result.user.email).toBe("john@example.com");
        expect(result.accessToken).toBe("mock-access-token");
        expect(result.refreshToken).toBe("mock-refresh-token");
      }
    });

    it("should call repository login method with correct parameters", async () => {
      const loginDto = new LoginDto("jane@example.com", "password456");

      const repositorySpy = jest.spyOn(mockRepository, "login");

      await loginUser.execute(loginDto);

      expect(repositorySpy).toHaveBeenCalledTimes(1);
      expect(repositorySpy).toHaveBeenCalledWith(loginDto);
    });

    it("should propagate repository errors", async () => {
      const loginDto = new LoginDto("john@example.com", "password123");

      mockRepository.setShouldFail(true, "Login failed");

      await expect(loginUser.execute(loginDto)).rejects.toThrow("Login failed");
    });

    it("should work with custom mock result", async () => {
      const customUser = new UserEntity(
        "custom-123",
        "custom@example.com",
        "Custom User",
        true,
        "+1234567890",
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

      const loginDto = new LoginDto("any@example.com", "anypassword");

      const result = await loginUser.execute(loginDto);

      if (result instanceof AuthUserEntity) {
        expect(result.user.id).toBe("custom-123");
        expect(result.user.email).toBe("custom@example.com");
        expect(result.user.name).toBe("Custom User");
        expect(result.accessToken).toBe("custom-access-token");
        expect(result.refreshToken).toBe("custom-refresh-token");
      }
    });
  });
});
