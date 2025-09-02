import { AuthRepository } from "../auth.repository";
import { RegisterDto } from "../../dtos/register.dto";
import { AuthUserEntity } from "../../entities/auth-user.entity";
import { UserEntity } from "../../entities/user.entity";
import { LoginDto } from "@/domain/dtos/login.dto";

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
