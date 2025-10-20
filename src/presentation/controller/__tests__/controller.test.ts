import { Request, Response, NextFunction } from "express";
import { AuthController } from "../controller";
import { RegisterDto } from "@/domain/auth/dtos/register.dto";
import { LoginDto } from "@/domain/auth/dtos/login.dto";
import { UpdateUserDto } from "@/domain/dtos/update-user.dto";
import { RequestResetPasswordEmailDto } from "@/domain/auth/dtos/request-reset-password-email.dto";
import { AuthRepository } from "@/domain/repositories/auth.repository";
import { RegisterUser } from "@/domain/auth/use-cases/register-user";
import { LoginUser } from "@/domain/auth/use-cases/login-user";
import { UpdateUser } from "@/domain/use-cases/update-user";
import { UpdateUserPassword } from "@/domain/use-cases/update-user-password";
import { RequestResetPasswordEmail } from "@/domain/auth/use-cases/request-reset-password-email";
import { LogoutAuth } from "@/domain/auth/use-cases/logout-user";
import { RegisterValidator } from "@/infrastructure/validators/register.validator";
import { LoginValidator } from "@/infrastructure/validators/login.validator";
import { UpdateUserValidator } from "@/infrastructure/validators/update-user.validator";
import { RequestResetPasswordEmailValidator } from "@/infrastructure/validators/request-reset-password-email.validator";
import { LogoutValidator } from "@/infrastructure/validators/logout.validator";
import { UserEntity } from "@/domain/entities/user.entity";
import { AuthUserEntity } from "@/domain/entities/auth-user.entity";

// Mock dependencies
jest.mock("@/domain/auth/use-cases/register-user");
jest.mock("@/domain/auth/use-cases/login-user");
jest.mock("@/domain/use-cases/update-user");
jest.mock("@/domain/use-cases/update-user-password");
jest.mock("@/domain/auth/use-cases/request-reset-password-email");
jest.mock("@/domain/auth/use-cases/logout-user");
jest.mock("@/infrastructure/validators/register.validator");
jest.mock("@/infrastructure/validators/login.validator");
jest.mock("@/infrastructure/validators/update-user.validator");
jest.mock("@/infrastructure/validators/request-reset-password-email.validator");
jest.mock("@/infrastructure/validators/logout.validator");

describe("AuthController", () => {
  let authController: AuthController;
  let mockDatasource: jest.Mocked<AuthRepository>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let mockRegisterUser: jest.Mocked<RegisterUser>;
  let mockLoginUser: jest.Mocked<LoginUser>;
  let mockUpdateUser: jest.Mocked<UpdateUser>;
  let mockUpdateUserPassword: jest.Mocked<UpdateUserPassword>;
  let mockRequestResetPasswordEmail: jest.Mocked<RequestResetPasswordEmail>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock datasource
    mockDatasource = {} as jest.Mocked<AuthRepository>;

    // Mock Request
    mockRequest = {
      body: {
        name: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
        password: "SecurePass123!",
      },
    };

    // Mock Response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock NextFunction
    mockNext = jest.fn();

    // Mock RegisterUser
    mockRegisterUser = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RegisterUser>;
    (RegisterUser as jest.Mock).mockImplementation(() => mockRegisterUser);

    // Mock LoginUser
    mockLoginUser = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<LoginUser>;
    (LoginUser as jest.Mock).mockImplementation(() => mockLoginUser);

    // Mock UpdateUser
    mockUpdateUser = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateUser>;
    (UpdateUser as jest.Mock).mockImplementation(() => mockUpdateUser);

    // Mock UpdateUserPassword
    mockUpdateUserPassword = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateUserPassword>;
    (UpdateUserPassword as jest.Mock).mockImplementation(
      () => mockUpdateUserPassword,
    );

    // Mock RequestResetPasswordEmail
    mockRequestResetPasswordEmail = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RequestResetPasswordEmail>;
    (RequestResetPasswordEmail as jest.Mock).mockImplementation(
      () => mockRequestResetPasswordEmail,
    );

    // Create controller instance
    authController = new AuthController(mockDatasource);
  });

  describe("Constructor", () => {
    it("should create an instance with datasource", () => {
      expect(authController).toBeInstanceOf(AuthController);
      expect(authController["datasource"]).toBe(mockDatasource);
    });

    it("should have register method bound to instance", () => {
      expect(typeof authController.register).toBe("function");
      expect(authController.register).toBeDefined();
    });

    it("should have login method bound to instance", () => {
      expect(typeof authController.login).toBe("function");
      expect(authController.login).toBeDefined();
    });

    it("should have updateUser method bound to instance", () => {
      expect(typeof authController.updateUser).toBe("function");
      expect(authController.updateUser).toBeDefined();
    });

    it("should have updateUserPassword method bound to instance", () => {
      expect(typeof authController.updateUserPassword).toBe("function");
      expect(authController.updateUserPassword).toBeDefined();
    });

    it("should have requestResetPasswordEmail method bound to instance", () => {
      expect(typeof authController.requestResetPasswordEmail).toBe("function");
      expect(authController.requestResetPasswordEmail).toBeDefined();
    });
  });

  describe("register method", () => {
    describe("Successful registration", () => {
      beforeEach(() => {
        const mockDto = new RegisterDto(
          "John",
          "Doe",
          "john.doe@example.com",
          "SecurePass123!",
        );
        (RegisterValidator.validate as jest.Mock).mockReturnValue(mockDto);
      });

      it("should validate request body", () => {
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );
        mockRegisterUser.execute.mockResolvedValue(mockUser);

        authController.register(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(RegisterValidator.validate).toHaveBeenCalledTimes(1);
        expect(RegisterValidator.validate).toHaveBeenCalledWith(
          mockRequest.body,
        );
      });

      it("should create RegisterUser use case with datasource", () => {
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );
        mockRegisterUser.execute.mockResolvedValue(mockUser);

        authController.register(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(RegisterUser).toHaveBeenCalledTimes(1);
        expect(RegisterUser).toHaveBeenCalledWith(mockDatasource);
      });

      it("should execute use case with validated DTO", async () => {
        const mockDto = new RegisterDto(
          "John",
          "Doe",
          "john.doe@example.com",
          "SecurePass123!",
        );
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );

        (RegisterValidator.validate as jest.Mock).mockReturnValue(mockDto);
        mockRegisterUser.execute.mockResolvedValue(mockUser);

        authController.register(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockRegisterUser.execute).toHaveBeenCalledTimes(1);
        expect(mockRegisterUser.execute).toHaveBeenCalledWith(mockDto);
      });

      it("should return user data on successful registration", async () => {
        const mockDto = new RegisterDto(
          "John",
          "Doe",
          "john.doe@example.com",
          "SecurePass123!",
        );
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );

        (RegisterValidator.validate as jest.Mock).mockReturnValue(mockDto);
        mockRegisterUser.execute.mockResolvedValue(mockUser);

        authController.register(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith({
          status: "success",
          data: mockUser,
          meta: {
            requestId: expect.any(String),
            timestamp: expect.any(String),
            version: "1.0.0",
          },
        });
      });
    });

    describe("Validation errors", () => {
      it("should call next with validation error when validation fails", () => {
        const validationError = new Error("Invalid email format");
        (RegisterValidator.validate as jest.Mock).mockImplementation(() => {
          throw validationError;
        });

        authController.register(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(validationError);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it("should not execute use case when validation fails", () => {
        const validationError = new Error("Invalid data");
        (RegisterValidator.validate as jest.Mock).mockImplementation(() => {
          throw validationError;
        });

        authController.register(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(RegisterUser).not.toHaveBeenCalled();
        expect(mockRegisterUser.execute).not.toHaveBeenCalled();
      });
    });

    describe("Use case execution errors", () => {
      beforeEach(() => {
        const mockDto = new RegisterDto(
          "John",
          "Doe",
          "john.doe@example.com",
          "SecurePass123!",
        );
        (RegisterValidator.validate as jest.Mock).mockReturnValue(mockDto);
      });

      it("should call next with use case error", async () => {
        const error = new Error("User already exists");
        mockRegisterUser.execute.mockRejectedValue(error);

        authController.register(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to reject
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it("should handle database connection errors", async () => {
        const error = new Error("Database connection failed");
        mockRegisterUser.execute.mockRejectedValue(error);

        authController.register(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to reject
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });
  });

  describe("updateUser method", () => {
    beforeEach(() => {
      // Mock updateUser request
      mockRequest = {
        body: {
          sessionToken: "mock-session-token",
          refreshToken: "mock-refresh-token",
          email: "john.doe@example.com",
          newPassword: "NewSecurePass123!",
          phone: "+1234567890",
        },
      };
    });

    describe("Successful update", () => {
      beforeEach(() => {
        const mockDto = new UpdateUserDto(
          "mock-session-token",
          "mock-refresh-token",
          "john.doe@example.com",
          "NewSecurePass123!",
          "+1234567890",
        );
        (UpdateUserValidator.validate as jest.Mock).mockReturnValue(mockDto);
      });

      it("should validate request body", () => {
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );
        mockUpdateUser.execute.mockResolvedValue(mockUser);

        authController.updateUser(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(UpdateUserValidator.validate).toHaveBeenCalledTimes(1);
        expect(UpdateUserValidator.validate).toHaveBeenCalledWith(
          mockRequest.body,
        );
      });

      it("should create UpdateUser use case with datasource", () => {
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );
        mockUpdateUser.execute.mockResolvedValue(mockUser);

        authController.updateUser(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(UpdateUser).toHaveBeenCalledTimes(1);
        expect(UpdateUser).toHaveBeenCalledWith(mockDatasource);
      });

      it("should execute use case with validated DTO", async () => {
        const mockDto = new UpdateUserDto(
          "mock-session-token",
          "mock-refresh-token",
          "john.doe@example.com",
          "NewSecurePass123!",
          "+1234567890",
        );
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );

        (UpdateUserValidator.validate as jest.Mock).mockReturnValue(mockDto);
        mockUpdateUser.execute.mockResolvedValue(mockUser);

        authController.updateUser(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockUpdateUser.execute).toHaveBeenCalledTimes(1);
        expect(mockUpdateUser.execute).toHaveBeenCalledWith(mockDto);
      });

      it("should return user data on successful update", async () => {
        const mockDto = new UpdateUserDto(
          "mock-session-token",
          "mock-refresh-token",
          "john.doe@example.com",
          "NewSecurePass123!",
          "+1234567890",
        );
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );

        (UpdateUserValidator.validate as jest.Mock).mockReturnValue(mockDto);
        mockUpdateUser.execute.mockResolvedValue(mockUser);

        authController.updateUser(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith({
          status: "success",
          data: mockUser,
          meta: {
            timestamp: expect.any(String),
            requestId: expect.any(String),
            version: expect.any(String),
          },
        });
        expect(mockResponse.status).toHaveBeenCalledWith(200);
      });

      it("should not call next on successful update", async () => {
        const mockDto = new UpdateUserDto(
          "mock-session-token",
          "mock-refresh-token",
          "john.doe@example.com",
          "NewSecurePass123!",
          "+1234567890",
        );
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );

        (UpdateUserValidator.validate as jest.Mock).mockReturnValue(mockDto);
        mockUpdateUser.execute.mockResolvedValue(mockUser);

        authController.updateUser(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe("Validation errors", () => {
      it("should call next with validation error", () => {
        const error = new Error("Invalid update data");
        (UpdateUserValidator.validate as jest.Mock).mockImplementation(() => {
          throw error;
        });

        authController.updateUser(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockUpdateUser.execute).not.toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it("should handle missing required fields", () => {
        const error = new Error("Session token is required");
        (UpdateUserValidator.validate as jest.Mock).mockImplementation(() => {
          throw error;
        });

        authController.updateUser(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
      });

      it("should handle invalid email format", () => {
        const error = new Error("Invalid email format");
        (UpdateUserValidator.validate as jest.Mock).mockImplementation(() => {
          throw error;
        });

        authController.updateUser(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });

    describe("Use case errors", () => {
      beforeEach(() => {
        const mockDto = new UpdateUserDto(
          "mock-session-token",
          "mock-refresh-token",
          "john.doe@example.com",
          "NewSecurePass123!",
          "+1234567890",
        );
        (UpdateUserValidator.validate as jest.Mock).mockReturnValue(mockDto);
      });

      it("should call next with use case error", async () => {
        const error = new Error("User not found");
        mockUpdateUser.execute.mockRejectedValue(error);

        authController.updateUser(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to reject
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it("should handle session validation errors", async () => {
        const error = new Error("Invalid session token");
        mockUpdateUser.execute.mockRejectedValue(error);

        authController.updateUser(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to reject
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
      });

      it("should handle database errors", async () => {
        const error = new Error("Database connection failed");
        mockUpdateUser.execute.mockRejectedValue(error);

        authController.updateUser(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to reject
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });
  });

  describe("Method binding", () => {
    it("should maintain correct context when method is extracted", () => {
      const { register } = authController;
      const mockDto = new RegisterDto(
        "John",
        "Doe",
        "john.doe@example.com",
        "SecurePass123!",
      );
      const mockUser = new UserEntity(
        "1",
        "john.doe@example.com",
        "John Doe",
        true,
        "+1234567890",
      );

      (RegisterValidator.validate as jest.Mock).mockReturnValue(mockDto);
      mockRegisterUser.execute.mockResolvedValue(mockUser);

      // Should work even when method is extracted from instance
      expect(() =>
        register(mockRequest as Request, mockResponse as Response, mockNext),
      ).not.toThrow();
      expect(RegisterUser).toHaveBeenCalledWith(mockDatasource);
    });
  });

  describe("Integration", () => {
    it("should properly integrate all dependencies", async () => {
      const mockDto = new RegisterDto(
        "John",
        "Doe",
        "john.doe@example.com",
        "SecurePass123!",
      );
      const mockUser = new UserEntity(
        "1",
        "john.doe@example.com",
        "John Doe",
        true,
        "+1234567890",
      );

      (RegisterValidator.validate as jest.Mock).mockReturnValue(mockDto);
      mockRegisterUser.execute.mockResolvedValue(mockUser);

      authController.register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      // Verify the complete flow
      expect(RegisterValidator.validate).toHaveBeenCalledWith(mockRequest.body);
      expect(RegisterUser).toHaveBeenCalledWith(mockDatasource);
      expect(mockRegisterUser.execute).toHaveBeenCalledWith(mockDto);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        data: mockUser,
        meta: {
          requestId: expect.any(String),
          timestamp: expect.any(String),
          version: "1.0.0",
        },
      });
      expect(mockNext).not.toHaveBeenCalled(); // No errors should be passed to next
    });
  });

  describe("login method", () => {
    beforeEach(() => {
      // Mock login request
      mockRequest = {
        body: {
          email: "john.doe@example.com",
          password: "SecurePass123!",
        },
      };
    });

    describe("Successful login", () => {
      beforeEach(() => {
        const mockDto = new LoginDto("john.doe@example.com", "SecurePass123!");
        (LoginValidator.validate as jest.Mock).mockReturnValue(mockDto);
      });

      it("should validate request body", () => {
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );
        const mockAuthUser = AuthUserEntity.createFrom({
          user: mockUser,
          data: {
            access_token: "mock-access-token",
            refresh_token: "mock-refresh-token",
          },
        });
        mockLoginUser.execute.mockResolvedValue(mockAuthUser);

        authController.login(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(LoginValidator.validate).toHaveBeenCalledTimes(1);
        expect(LoginValidator.validate).toHaveBeenCalledWith(mockRequest.body);
      });

      it("should create LoginUser use case with datasource", () => {
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );
        const mockAuthUser = AuthUserEntity.createFrom({
          user: mockUser,
          data: {
            access_token: "mock-access-token",
            refresh_token: "mock-refresh-token",
          },
        });
        mockLoginUser.execute.mockResolvedValue(mockAuthUser);

        authController.login(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(LoginUser).toHaveBeenCalledTimes(1);
        expect(LoginUser).toHaveBeenCalledWith(mockDatasource);
      });

      it("should execute use case with validated DTO", async () => {
        const mockDto = new LoginDto("john.doe@example.com", "SecurePass123!");
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );
        const mockAuthUser = AuthUserEntity.createFrom({
          user: mockUser,
          data: {
            access_token: "mock-access-token",
            refresh_token: "mock-refresh-token",
          },
        });

        (LoginValidator.validate as jest.Mock).mockReturnValue(mockDto);
        mockLoginUser.execute.mockResolvedValue(mockAuthUser);

        authController.login(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockLoginUser.execute).toHaveBeenCalledTimes(1);
        expect(mockLoginUser.execute).toHaveBeenCalledWith(mockDto);
      });

      it("should return auth user data on successful login", async () => {
        const mockDto = new LoginDto("john.doe@example.com", "SecurePass123!");
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );
        const mockAuthUser = AuthUserEntity.createFrom({
          user: mockUser,
          data: {
            access_token: "mock-access-token",
            refresh_token: "mock-refresh-token",
          },
        });

        (LoginValidator.validate as jest.Mock).mockReturnValue(mockDto);
        mockLoginUser.execute.mockResolvedValue(mockAuthUser);

        authController.login(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith({
          status: "success",
          data: mockAuthUser,
          meta: {
            requestId: expect.any(String),
            timestamp: expect.any(String),
            version: "1.0.0",
          },
        });
      });
    });

    describe("Validation errors", () => {
      it("should call next with validation error when validation fails", () => {
        const validationError = new Error("Invalid email format");
        (LoginValidator.validate as jest.Mock).mockImplementation(() => {
          throw validationError;
        });

        authController.login(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(validationError);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it("should not execute use case when validation fails", () => {
        const validationError = new Error("Invalid credentials");
        (LoginValidator.validate as jest.Mock).mockImplementation(() => {
          throw validationError;
        });

        authController.login(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(LoginUser).not.toHaveBeenCalled();
        expect(mockLoginUser.execute).not.toHaveBeenCalled();
      });
    });

    describe("Use case execution errors", () => {
      beforeEach(() => {
        const mockDto = new LoginDto("john.doe@example.com", "SecurePass123!");
        (LoginValidator.validate as jest.Mock).mockReturnValue(mockDto);
      });

      it("should call next with use case error", async () => {
        const error = new Error("Invalid credentials");
        mockLoginUser.execute.mockRejectedValue(error);

        authController.login(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to reject
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it("should handle authentication errors", async () => {
        const error = new Error("User not found");
        mockLoginUser.execute.mockRejectedValue(error);

        authController.login(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to reject
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });
  });

  describe("Method binding", () => {
    it("should maintain correct context when login method is extracted", () => {
      const { login } = authController;
      const mockDto = new LoginDto("john.doe@example.com", "SecurePass123!");
      const mockUser = new UserEntity(
        "1",
        "john.doe@example.com",
        "John Doe",
        true,
        "+1234567890",
      );
      const mockAuthUser = AuthUserEntity.createFrom({
        user: mockUser,
        data: {
          access_token: "mock-access-token",
          refresh_token: "mock-refresh-token",
        },
      });

      (LoginValidator.validate as jest.Mock).mockReturnValue(mockDto);
      mockLoginUser.execute.mockResolvedValue(mockAuthUser);

      // Should work even when method is extracted from instance
      expect(() =>
        login(mockRequest as Request, mockResponse as Response, mockNext),
      ).not.toThrow();
      expect(LoginUser).toHaveBeenCalledWith(mockDatasource);
    });

    it("should maintain correct context when updateUser method is extracted", () => {
      const { updateUser } = authController;
      const mockDto = new UpdateUserDto(
        "mock-session-token",
        "mock-refresh-token",
        "john.doe@example.com",
        "NewSecurePass123!",
        "+1234567890",
      );
      const mockUser = new UserEntity(
        "1",
        "john.doe@example.com",
        "John Doe",
        true,
        "+1234567890",
      );

      (UpdateUserValidator.validate as jest.Mock).mockReturnValue(mockDto);
      mockUpdateUser.execute.mockResolvedValue(mockUser);

      // Should work even when method is extracted from instance
      expect(() =>
        updateUser(mockRequest as Request, mockResponse as Response, mockNext),
      ).not.toThrow();
      expect(UpdateUser).toHaveBeenCalledWith(mockDatasource);
    });
  });

  describe("updateUserPassword method", () => {
    beforeEach(() => {
      // Mock updateUserPassword request
      mockRequest = {
        body: {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-456",
          newPassword: "NewSecurePass123!",
          newPasswordConfirmation: "NewSecurePass123!",
        },
      };
    });

    describe("Successful password update", () => {
      beforeEach(() => {
        const mockDto = new UpdateUserDto(
          "session-token-123",
          "refresh-token-456",
          undefined,
          "NewSecurePass123!",
          "NewSecurePass123!",
        );
        (UpdateUserValidator.validate as jest.Mock).mockReturnValue(mockDto);
      });

      it("should validate request body", () => {
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );
        const mockAuthUser = AuthUserEntity.createFrom({
          user: mockUser,
          data: {
            access_token: "session-token-123",
            refresh_token: "refresh-token-456",
          },
        });
        mockUpdateUserPassword.execute.mockResolvedValue(mockAuthUser);

        authController.updateUserPassword(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(UpdateUserValidator.validate).toHaveBeenCalledTimes(1);
        expect(UpdateUserValidator.validate).toHaveBeenCalledWith(
          mockRequest.body,
        );
      });

      it("should create UpdateUserPassword use case with datasource", () => {
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );
        const mockAuthUser = AuthUserEntity.createFrom({
          user: mockUser,
          data: {
            access_token: "session-token-123",
            refresh_token: "refresh-token-456",
          },
        });
        mockUpdateUserPassword.execute.mockResolvedValue(mockAuthUser);

        authController.updateUserPassword(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(UpdateUserPassword).toHaveBeenCalledTimes(1);
        expect(UpdateUserPassword).toHaveBeenCalledWith(mockDatasource);
      });

      it("should execute use case with validated DTO", async () => {
        const mockDto = new UpdateUserDto(
          "session-token-123",
          "refresh-token-456",
          undefined,
          "NewSecurePass123!",
          "NewSecurePass123!",
        );
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );
        const mockAuthUser = AuthUserEntity.createFrom({
          user: mockUser,
          data: {
            access_token: "session-token-123",
            refresh_token: "refresh-token-456",
          },
        });

        (UpdateUserValidator.validate as jest.Mock).mockReturnValue(mockDto);
        mockUpdateUserPassword.execute.mockResolvedValue(mockAuthUser);

        authController.updateUserPassword(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockUpdateUserPassword.execute).toHaveBeenCalledTimes(1);
        expect(mockUpdateUserPassword.execute).toHaveBeenCalledWith(mockDto);
      });

      it("should return auth user data on successful password update", async () => {
        const mockDto = new UpdateUserDto(
          "session-token-123",
          "refresh-token-456",
          undefined,
          "NewSecurePass123!",
          "NewSecurePass123!",
        );
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );
        const mockAuthUser = AuthUserEntity.createFrom({
          user: mockUser,
          data: {
            access_token: "session-token-123",
            refresh_token: "refresh-token-456",
          },
        });

        (UpdateUserValidator.validate as jest.Mock).mockReturnValue(mockDto);
        mockUpdateUserPassword.execute.mockResolvedValue(mockAuthUser);

        authController.updateUserPassword(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith({
          status: "success",
          data: mockAuthUser,
          meta: {
            requestId: expect.any(String),
            timestamp: expect.any(String),
            version: "1.0.0",
          },
        });
      });
    });

    describe("Validation errors", () => {
      it("should call next with validation error when validation fails", () => {
        const validationError = new Error("Password is required");
        (UpdateUserValidator.validate as jest.Mock).mockImplementation(() => {
          throw validationError;
        });

        authController.updateUserPassword(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(validationError);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it("should not execute use case when validation fails", () => {
        const validationError = new Error("Invalid password format");
        (UpdateUserValidator.validate as jest.Mock).mockImplementation(() => {
          throw validationError;
        });

        authController.updateUserPassword(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(UpdateUserPassword).not.toHaveBeenCalled();
        expect(mockUpdateUserPassword.execute).not.toHaveBeenCalled();
      });
    });

    describe("Use case execution errors", () => {
      beforeEach(() => {
        const mockDto = new UpdateUserDto(
          "session-token-123",
          "refresh-token-456",
          undefined,
          "NewSecurePass123!",
          "NewSecurePass123!",
        );
        (UpdateUserValidator.validate as jest.Mock).mockReturnValue(mockDto);
      });

      it("should call next with use case error", async () => {
        const error = new Error("Password update failed");
        mockUpdateUserPassword.execute.mockRejectedValue(error);

        authController.updateUserPassword(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to reject
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it("should handle authentication errors", async () => {
        const error = new Error("Invalid session token");
        mockUpdateUserPassword.execute.mockRejectedValue(error);

        authController.updateUserPassword(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to reject
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });

    describe("Method binding", () => {
      it("should maintain correct context when updateUserPassword method is extracted", () => {
        const { updateUserPassword } = authController;
        const mockDto = new UpdateUserDto(
          "session-token-123",
          "refresh-token-456",
          undefined,
          "NewSecurePass123!",
          "NewSecurePass123!",
        );
        const mockUser = new UserEntity(
          "1",
          "john.doe@example.com",
          "John Doe",
          true,
          "+1234567890",
        );
        const mockAuthUser = AuthUserEntity.createFrom({
          user: mockUser,
          data: {
            access_token: "session-token-123",
            refresh_token: "refresh-token-456",
          },
        });

        (UpdateUserValidator.validate as jest.Mock).mockReturnValue(mockDto);
        mockUpdateUserPassword.execute.mockResolvedValue(mockAuthUser);

        // Should work even when method is extracted from instance
        expect(() =>
          updateUserPassword(
            mockRequest as Request,
            mockResponse as Response,
            mockNext,
          ),
        ).not.toThrow();
        expect(UpdateUserPassword).toHaveBeenCalledWith(mockDatasource);
      });
    });
  });

  describe("logout method", () => {
    beforeEach(() => {
      // Mock logout request
      mockRequest = {
        body: {
          userId: "user-123",
        },
      };
    });

    describe("Successful logout", () => {
      beforeEach(() => {
        const mockDto = { userId: "user-123" };
        (LogoutValidator.validate as jest.Mock).mockReturnValue(mockDto);
      });

      it("should validate request body", () => {
        const mockLogoutAuth = {
          execute: jest.fn().mockResolvedValue(undefined),
        };
        (LogoutAuth as jest.Mock).mockImplementation(() => mockLogoutAuth);

        authController.logout(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(LogoutValidator.validate).toHaveBeenCalledTimes(1);
        expect(LogoutValidator.validate).toHaveBeenCalledWith(mockRequest.body);
      });

      it("should call LogoutAuth use case with correct DTO", async () => {
        const mockLogoutAuth = {
          execute: jest.fn().mockResolvedValue(undefined),
        };
        (LogoutAuth as jest.Mock).mockImplementation(() => mockLogoutAuth);

        await authController.logout(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(LogoutAuth).toHaveBeenCalledWith(mockDatasource);
        expect(mockLogoutAuth.execute).toHaveBeenCalledTimes(1);
      });

      it("should return success response on successful logout", async () => {
        const mockLogoutAuth = {
          execute: jest.fn().mockResolvedValue(undefined),
        };
        (LogoutAuth as jest.Mock).mockImplementation(() => mockLogoutAuth);

        await authController.logout(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
          status: "success",
          data: { message: "Logout successful" },
          meta: {
            requestId: expect.any(String),
            timestamp: expect.any(String),
            version: "1.0.0",
          },
        });
      });
    });

    describe("Validation errors", () => {
      it("should call next with validation error when validation fails", () => {
        const validationError = new Error("Invalid user ID");
        (LogoutValidator.validate as jest.Mock).mockImplementation(() => {
          throw validationError;
        });

        authController.logout(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(validationError);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });
    });

    describe("Use case errors", () => {
      it("should call next with error when use case fails", (done) => {
        const mockDto = { userId: "user-123" };
        (LogoutValidator.validate as jest.Mock).mockReturnValue(mockDto);

        const error = new Error("Logout failed");
        const mockLogoutAuth = {
          execute: jest.fn().mockRejectedValue(error),
        };
        (LogoutAuth as jest.Mock).mockImplementation(() => mockLogoutAuth);

        authController.logout(
          mockRequest as Request,
          mockResponse as Response,
          (err) => {
            expect(err).toBe(error);
            done();
          },
        );
      });
    });
  });

  describe("requestResetPasswordEmail method", () => {
    beforeEach(() => {
      // Mock requestResetPasswordEmail request
      mockRequest = {
        body: {
          email: "john.doe@example.com",
          redirectTo: "https://example.com/reset-password",
        },
      };
    });

    describe("Successful password reset email request", () => {
      beforeEach(() => {
        const mockDto = new RequestResetPasswordEmailDto(
          "john.doe@example.com",
          "https://example.com/reset-password",
        );
        (
          RequestResetPasswordEmailValidator.validate as jest.Mock
        ).mockReturnValue(mockDto);
      });

      it("should validate request body", () => {
        mockRequestResetPasswordEmail.execute.mockResolvedValue(undefined);

        authController.requestResetPasswordEmail(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(
          RequestResetPasswordEmailValidator.validate,
        ).toHaveBeenCalledTimes(1);
        expect(
          RequestResetPasswordEmailValidator.validate,
        ).toHaveBeenCalledWith(mockRequest.body);
      });

      it("should call RequestResetPasswordEmail use case with correct DTO", async () => {
        mockRequestResetPasswordEmail.execute.mockResolvedValue(undefined);

        await authController.requestResetPasswordEmail(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(RequestResetPasswordEmail).toHaveBeenCalledWith(mockDatasource);
        expect(mockRequestResetPasswordEmail.execute).toHaveBeenCalledTimes(1);
      });

      it("should return success response", async () => {
        mockRequestResetPasswordEmail.execute.mockResolvedValue(undefined);

        await authController.requestResetPasswordEmail(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
          status: "success",
          data: { message: "Reset password email sent successfully" },
          meta: expect.objectContaining({
            requestId: "",
            timestamp: expect.any(String),
            version: "1.0.0",
          }),
        });
      });
    });

    describe("Error scenarios", () => {
      it("should handle validation errors", async () => {
        const error = new Error("Invalid email format");
        mockRequestResetPasswordEmail.execute.mockRejectedValue(error);

        authController.requestResetPasswordEmail(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to reject
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
      });

      it("should handle use case execution errors", async () => {
        const error = new Error("Email not sent");
        mockRequestResetPasswordEmail.execute.mockRejectedValue(error);

        authController.requestResetPasswordEmail(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        // Wait for promise to reject
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });

    describe("Method binding", () => {
      it("should maintain correct context when requestResetPasswordEmail method is extracted", () => {
        const { requestResetPasswordEmail } = authController;
        const mockDto = new RequestResetPasswordEmailDto(
          "john.doe@example.com",
          "https://example.com/reset-password",
        );

        (
          RequestResetPasswordEmailValidator.validate as jest.Mock
        ).mockReturnValue(mockDto);
        mockRequestResetPasswordEmail.execute.mockResolvedValue(undefined);

        // Should work even when method is extracted from instance
        expect(() =>
          requestResetPasswordEmail(
            mockRequest as Request,
            mockResponse as Response,
            mockNext,
          ),
        ).not.toThrow();
        expect(RequestResetPasswordEmail).toHaveBeenCalledWith(mockDatasource);
      });
    });

    describe("Validation errors", () => {
      it("should call next with validation error when validation fails", () => {
        const validationError = new Error("Invalid email format");
        (
          RequestResetPasswordEmailValidator.validate as jest.Mock
        ).mockImplementation(() => {
          throw validationError;
        });

        authController.requestResetPasswordEmail(
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(validationError);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });
    });
  });
});
