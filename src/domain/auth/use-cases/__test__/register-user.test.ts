import { RegisterUser } from "../register-user";
import { RegisterDto } from "@/domain/auth/dtos/register.dto";
import { AuthUserEntity } from "@/domain/auth/entities/auth-user.entity";
import { UserEntity } from "@/domain/user/entities/user.entity";
import { MockAuthRepository } from "@/tests/__mocks__/auth-repository.mock";

describe("RegisterUser", () => {
  let registerUser: RegisterUser;
  let mockRepository: MockAuthRepository;

  beforeEach(() => {
    mockRepository = new MockAuthRepository();
    registerUser = new RegisterUser(mockRepository);
  });

  describe("constructor", () => {
    it("should create RegisterUser instance with repository dependency", () => {
      expect(registerUser).toBeInstanceOf(RegisterUser);
      expect(registerUser).toBeDefined();
    });

    it("should store repository reference", () => {
      // Access private property for testing
      expect((registerUser as any).repository).toBe(mockRepository);
    });
  });

  describe("execute", () => {
    it("should successfully register user with valid data", async () => {
      const [error, registerDto] = RegisterDto.createFrom({
        name: "John",
        lastname: "Doe",
        email: "john@example.com",
        password: "password123",
        role: "USER",
      });
      expect(error).toBeUndefined();

      const result = await registerUser.execute(registerDto!);

      expect(result).toBeInstanceOf(AuthUserEntity);
      if (result instanceof AuthUserEntity) {
        expect(result.user).toBeInstanceOf(UserEntity);
        expect(result.user.email).toBe("john@example.com");
        expect(result.user.name).toBe("John Doe");
        expect(result.accessToken).toBe("mock-access-token");
        expect(result.refreshToken).toBe("mock-refresh-token");
      }
    });

    it("should call repository register method with correct parameters", async () => {
      const [error, registerDto] = RegisterDto.createFrom({
        name: "Jane",
        lastname: "Smith",
        email: "jane@example.com",
        password: "password456",
        role: "USER",
      });
      expect(error).toBeUndefined();

      const repositorySpy = jest.spyOn(mockRepository, "register");

      await registerUser.execute(registerDto!);

      expect(repositorySpy).toHaveBeenCalledTimes(1);
      expect(repositorySpy).toHaveBeenCalledWith(registerDto);
    });

    it("should propagate repository errors", async () => {
      const [error, registerDto] = RegisterDto.createFrom({
        name: "John",
        lastname: "Doe",
        email: "john@example.com",
        password: "password123",
        role: "USER",
      });
      expect(error).toBeUndefined();

      mockRepository.setShouldFail(true, "Repository registration failed");

      await expect(registerUser.execute(registerDto!)).rejects.toThrow(
        "Repository registration failed",
      );
    });

    it("should handle different RegisterDto instances", async () => {
      const [error1, registerDto1] = RegisterDto.createFrom({
        name: "Alice",
        lastname: "Johnson",
        email: "alice@example.com",
        password: "password789",
        role: "USER",
      });
      const [error2, registerDto2] = RegisterDto.createFrom({
        name: "Bob",
        lastname: "Wilson",
        email: "bob@example.com",
        password: "password000",
        role: "USER",
      });
      expect(error1).toBeUndefined();
      expect(error2).toBeUndefined();

      const result1 = await registerUser.execute(registerDto1!);
      const result2 = await registerUser.execute(registerDto2!);

      if (
        result1 instanceof AuthUserEntity &&
        result2 instanceof AuthUserEntity
      ) {
        expect(result1.user.email).toBe("alice@example.com");
        expect(result1.user.name).toBe("Alice Johnson");
        expect(result2.user.email).toBe("bob@example.com");
        expect(result2.user.name).toBe("Bob Wilson");
      }
    });

    it("should return AuthUserEntity with correct structure", async () => {
      const [error, registerDto] = RegisterDto.createFrom({
        name: "Test",
        lastname: "User",
        email: "test@example.com",
        password: "testpassword",
        role: "USER",
      });
      expect(error).toBeUndefined();

      const result = await registerUser.execute(registerDto!);

      if (result instanceof AuthUserEntity) {
        expect(result).toHaveProperty("user");
        expect(result).toHaveProperty("accessToken");
        expect(result).toHaveProperty("refreshToken");
        expect(typeof result.accessToken).toBe("string");
        expect(typeof result.refreshToken).toBe("string");
        expect(result.accessToken.length).toBeGreaterThan(0);
        expect(result.refreshToken.length).toBeGreaterThan(0);
      }
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

      const [error, registerDto] = RegisterDto.createFrom({
        name: "Any",
        lastname: "Name",
        email: "any@example.com",
        password: "anypassword",
        role: "USER",
      });
      expect(error).toBeUndefined();

      const result = await registerUser.execute(registerDto!);

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
