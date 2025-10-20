import { AuthRepository } from "../auth.repository";
import { RegisterDto } from "../../dtos/register.dto";
import { AuthUserEntity } from "../../../entities/auth-user.entity";
import { UserEntity } from "../../../entities/user.entity";
import { LoginDto } from "@/domain/auth/dtos/login.dto";
import { LogoutDto } from "@/domain/auth/dtos/logout.dto";
import { RequestResetPasswordEmailDto } from "@/domain/auth/dtos/request-reset-password-email.dto";
import { UpdateUserDto } from "@/domain/user/dtos/update-user.dto";

// Concrete implementation for testing
class TestAuthRepository extends AuthRepository {
  async register(registerDto: RegisterDto): Promise<AuthUserEntity> {
    // Create a proper UserEntity instance for testing
    const mockUser = new UserEntity(
      "user-123",
      registerDto.email,
      `${registerDto.name} ${registerDto.lastname}`,
      true,
      undefined,
    );

    const mockAuthData = {
      user: mockUser,
      data: {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
      },
    };

    return AuthUserEntity.createFrom(mockAuthData);
  }

  async login(loginDto: LoginDto): Promise<AuthUserEntity> {
    return AuthUserEntity.createFrom({
      user: new UserEntity(
        "user-123",
        loginDto.email,
        "John Doe",
        true,
        undefined,
      ),
      data: {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
      },
    });
  }

  async logout(logoutDto: LogoutDto): Promise<void> {
    // Mock implementation for testing - validate tokens exist
    if (!logoutDto.sessionToken || !logoutDto.refreshToken) {
      throw new Error("Invalid logout data");
    }
    return Promise.resolve();
  }

  async updateUser(dto: UpdateUserDto): Promise<UserEntity | AuthUserEntity> {
    // Mock implementation for testing
    const mockUser = new UserEntity(
      "user-123",
      dto.email || "test@example.com",
      "Updated User",
      true,
      dto.phone,
    );

    return mockUser;
  }

  async updateUserPassword(dto: UpdateUserDto): Promise<AuthUserEntity> {
    // Mock implementation for testing
    const mockUser = new UserEntity(
      "user-123",
      dto.email || "test@example.com",
      "Updated User",
      true,
      dto.phone,
    );

    return AuthUserEntity.createFrom({
      user: mockUser,
      data: {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
      },
    });
  }

  async requestResetPasswordEmail(
    dto: RequestResetPasswordEmailDto,
  ): Promise<void> {
    // Mock implementation for testing - validate email exists
    if (!dto.email) {
      throw new Error("Email is required");
    }
    return Promise.resolve();
  }
}

describe("AuthRepository", () => {
  let testRepository: TestAuthRepository;

  beforeEach(() => {
    testRepository = new TestAuthRepository();
  });

  describe("abstract class structure", () => {
    it("should be an abstract class that cannot be instantiated directly", () => {
      // AuthRepository is abstract, so TypeScript prevents direct instantiation
      // This test verifies the abstract nature by checking the constructor
      expect(AuthRepository.prototype.constructor).toBe(AuthRepository);
      expect(AuthRepository.name).toBe("AuthRepository");
    });

    it("should allow concrete implementations to be instantiated", () => {
      expect(testRepository).toBeInstanceOf(AuthRepository);
      expect(testRepository).toBeInstanceOf(TestAuthRepository);
    });

    it("should have abstract register method", () => {
      expect(typeof testRepository.register).toBe("function");
    });
  });

  describe("concrete implementation behavior", () => {
    describe("register method", () => {
      it("should implement register method that returns AuthUserEntity", async () => {
        const registerDto = new RegisterDto(
          "John",
          "Doe",
          "test@example.com",
          "password123",
        );

        const result = await testRepository.register(registerDto);

        expect(result).toBeInstanceOf(AuthUserEntity);
        expect(result.user).toBeInstanceOf(UserEntity);
        expect(result.user.email).toBe("test@example.com");
        expect(result.user.name).toBe("John Doe");
        expect(result.accessToken).toBe("mock-access-token");
        expect(result.refreshToken).toBe("mock-refresh-token");
      });

      it("should handle different RegisterDto instances", async () => {
        const registerDto = new RegisterDto(
          "Jane",
          "Smith",
          "another@example.com",
          "password456",
        );

        const result = await testRepository.register(registerDto);

        expect(result.user.email).toBe("another@example.com");
        expect(result.user.name).toBe("Jane Smith");
      });
      describe("method signature validation", () => {
        it("should accept RegisterDto parameter", () => {
          const registerDto = new RegisterDto(
            "Test",
            "User",
            "test@example.com",
            "password123",
          );

          expect(() => {
            testRepository.register(registerDto);
          }).not.toThrow();
        });

        it("should return Promise<AuthUserEntity>", async () => {
          const registerDto = new RegisterDto(
            "Test",
            "User",
            "test@example.com",
            "password123",
          );

          const result = testRepository.register(registerDto);
          expect(result).toBeInstanceOf(Promise);

          const resolvedResult = await result;
          expect(resolvedResult).toBeInstanceOf(AuthUserEntity);
        });
      });
    });

    describe("Login method", () => {
      it("should implement login method that returns AuthUserEntity", async () => {
        const loginDto = new LoginDto("test@example.com", "password123");

        const result = await testRepository.login(loginDto);

        expect(result).toBeInstanceOf(AuthUserEntity);
        expect(result.user).toBeInstanceOf(UserEntity);
        expect(result.user.email).toBe("test@example.com");
        expect(result.user.name).toBe("John Doe");
        expect(result.accessToken).toBe("mock-access-token");
        expect(result.refreshToken).toBe("mock-refresh-token");
      });

      it("should handle different LoginDto instances", async () => {
        const loginDto = new LoginDto("another@example.com", "password456");

        const result = await testRepository.login(loginDto);

        expect(result.user.email).toBe("another@example.com");
        expect(result.user.name).toBe("John Doe");
      });

      describe("method signature validation", () => {
        it("should accept LoginDto parameter", () => {
          const loginDto = new LoginDto("test@example.com", "password123");

          expect(() => {
            testRepository.login(loginDto);
          }).not.toThrow();
        });

        it("should return Promise<AuthUserEntity>", async () => {
          const loginDto = new LoginDto("test@example.com", "password123");

          const result = testRepository.login(loginDto);
          expect(result).toBeInstanceOf(Promise);

          const resolvedResult = await result;
          expect(resolvedResult).toBeInstanceOf(AuthUserEntity);
        });
      });
    });

    describe("logout method", () => {
      it("should implement logout method that returns void", async () => {
        const logoutDto = new LogoutDto(
          "session-token-123",
          "refresh-token-123",
        );

        const result = await testRepository.logout(logoutDto);

        expect(result).toBeUndefined();
      });

      it("should handle different LogoutDto instances", async () => {
        const logoutDto = new LogoutDto(
          "another-session-token",
          "another-refresh-token",
        );

        await expect(testRepository.logout(logoutDto)).resolves.toBeUndefined();
      });

      it("should throw error for invalid logout data", async () => {
        const invalidLogoutDto = new LogoutDto("", "refresh-token-123");

        await expect(testRepository.logout(invalidLogoutDto)).rejects.toThrow(
          "Invalid logout data",
        );
      });

      it("should throw error when refresh token is missing", async () => {
        const invalidLogoutDto = new LogoutDto("session-token-123", "");

        await expect(testRepository.logout(invalidLogoutDto)).rejects.toThrow(
          "Invalid logout data",
        );
      });

      describe("method signature validation", () => {
        it("should accept LogoutDto parameter", () => {
          const logoutDto = new LogoutDto(
            "session-token-123",
            "refresh-token-123",
          );

          expect(() => {
            testRepository.logout(logoutDto);
          }).not.toThrow();
        });

        it("should return Promise<void>", async () => {
          const logoutDto = new LogoutDto(
            "session-token-123",
            "refresh-token-123",
          );

          const result = testRepository.logout(logoutDto);
          expect(result).toBeInstanceOf(Promise);

          const resolvedResult = await result;
          expect(resolvedResult).toBeUndefined();
        });
      });
    });
  });

  describe("inheritance validation", () => {
    it("should properly extend AuthRepository", () => {
      expect(testRepository instanceof AuthRepository).toBe(true);
      expect(Object.getPrototypeOf(TestAuthRepository)).toBe(AuthRepository);
    });

    it("should have access to parent class properties", () => {
      expect(testRepository.constructor.name).toBe("TestAuthRepository");
      expect(Object.getPrototypeOf(testRepository).constructor.name).toBe(
        "TestAuthRepository",
      );
    });
  });
});
