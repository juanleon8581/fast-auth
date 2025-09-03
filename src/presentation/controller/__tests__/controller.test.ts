import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../controller';
import { RegisterDto } from '@/domain/dtos/register.dto';
import { LoginDto } from '@/domain/dtos/login.dto';
import { AuthRepository } from '@/domain/repositories/auth.repository';
import { RegisterUser } from '@/domain/use-cases/register-user';
import { LoginUser } from '@/domain/use-cases/login-user';
import { RegisterValidator } from '@/infrastructure/validators/register.validator';
import { LoginValidator } from '@/infrastructure/validators/login.validator';
import { UserEntity } from '@/domain/entities/user.entity';
import { AuthUserEntity } from '@/domain/entities/auth-user.entity';

// Mock dependencies
jest.mock('@/domain/use-cases/register-user');
jest.mock('@/domain/use-cases/login-user');
jest.mock('@/infrastructure/validators/register.validator');
jest.mock('@/infrastructure/validators/login.validator');

describe('AuthController', () => {
  let authController: AuthController;
  let mockDatasource: jest.Mocked<AuthRepository>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let mockRegisterUser: jest.Mocked<RegisterUser>;
  let mockLoginUser: jest.Mocked<LoginUser>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock datasource
    mockDatasource = {} as jest.Mocked<AuthRepository>;

    // Mock Request
    mockRequest = {
      body: {
        name: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePass123!'
      }
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

    // Create controller instance
    authController = new AuthController(mockDatasource);
  });

  describe('Constructor', () => {
    it('should create an instance with datasource', () => {
      expect(authController).toBeInstanceOf(AuthController);
      expect(authController['datasource']).toBe(mockDatasource);
    });

    it('should have register method bound to instance', () => {
      expect(typeof authController.register).toBe('function');
      expect(authController.register).toBeDefined();
    });

    it('should have login method bound to instance', () => {
      expect(typeof authController.login).toBe('function');
      expect(authController.login).toBeDefined();
    });
  });

  describe('register method', () => {
    describe('Successful registration', () => {
      beforeEach(() => {
        const mockDto = new RegisterDto('John', 'Doe', 'john.doe@example.com', 'SecurePass123!');
        (RegisterValidator.validate as jest.Mock).mockReturnValue(mockDto);
      });

      it('should validate request body', () => {
        const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
        mockRegisterUser.execute.mockResolvedValue(mockUser);

        authController.register(mockRequest as Request, mockResponse as Response, mockNext);

        expect(RegisterValidator.validate).toHaveBeenCalledTimes(1);
        expect(RegisterValidator.validate).toHaveBeenCalledWith(mockRequest.body);
      });

      it('should create RegisterUser use case with datasource', () => {
        const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
        mockRegisterUser.execute.mockResolvedValue(mockUser);

        authController.register(mockRequest as Request, mockResponse as Response, mockNext);

        expect(RegisterUser).toHaveBeenCalledTimes(1);
        expect(RegisterUser).toHaveBeenCalledWith(mockDatasource);
      });

      it('should execute use case with validated DTO', async () => {
        const mockDto = new RegisterDto('John', 'Doe', 'john.doe@example.com', 'SecurePass123!');
        const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
        
        (RegisterValidator.validate as jest.Mock).mockReturnValue(mockDto);
        mockRegisterUser.execute.mockResolvedValue(mockUser);

        authController.register(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockRegisterUser.execute).toHaveBeenCalledTimes(1);
        expect(mockRegisterUser.execute).toHaveBeenCalledWith(mockDto);
      });

      it('should return user data on successful registration', async () => {
        const mockDto = new RegisterDto('John', 'Doe', 'john.doe@example.com', 'SecurePass123!');
        const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
        
        (RegisterValidator.validate as jest.Mock).mockReturnValue(mockDto);
        mockRegisterUser.execute.mockResolvedValue(mockUser);

        authController.register(mockRequest as Request, mockResponse as Response, mockNext);

        // Wait for promise to resolve
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith({
          status: 'success',
          data: mockUser,
          meta: {
            requestId: expect.any(String),
            timestamp: expect.any(String),
            version: '1.0.0'
          }
        });
      });
    });

    describe('Validation errors', () => {
      it('should call next with validation error when validation fails', () => {
        const validationError = new Error('Invalid email format');
        (RegisterValidator.validate as jest.Mock).mockImplementation(() => {
          throw validationError;
        });

        authController.register(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(validationError);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it('should not execute use case when validation fails', () => {
        const validationError = new Error('Invalid data');
        (RegisterValidator.validate as jest.Mock).mockImplementation(() => {
          throw validationError;
        });

        authController.register(mockRequest as Request, mockResponse as Response, mockNext);

        expect(RegisterUser).not.toHaveBeenCalled();
        expect(mockRegisterUser.execute).not.toHaveBeenCalled();
      });
    });

    describe('Use case execution errors', () => {
      beforeEach(() => {
        const mockDto = new RegisterDto('John', 'Doe', 'john.doe@example.com', 'SecurePass123!');
        (RegisterValidator.validate as jest.Mock).mockReturnValue(mockDto);
      });

      it('should call next with use case error', async () => {
        const error = new Error('User already exists');
        mockRegisterUser.execute.mockRejectedValue(error);

        authController.register(mockRequest as Request, mockResponse as Response, mockNext);

        // Wait for promise to reject
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it('should handle database connection errors', async () => {
        const error = new Error('Database connection failed');
        mockRegisterUser.execute.mockRejectedValue(error);

        authController.register(mockRequest as Request, mockResponse as Response, mockNext);

        // Wait for promise to reject
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('Method binding', () => {
    it('should maintain correct context when method is extracted', () => {
      const { register } = authController;
      const mockDto = new RegisterDto('John', 'Doe', 'john.doe@example.com', 'SecurePass123!');
      const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
      
      (RegisterValidator.validate as jest.Mock).mockReturnValue(mockDto);
      mockRegisterUser.execute.mockResolvedValue(mockUser);

      // Should work even when method is extracted from instance
      expect(() => register(mockRequest as Request, mockResponse as Response, mockNext)).not.toThrow();
      expect(RegisterUser).toHaveBeenCalledWith(mockDatasource);
    });
  });

  describe('Integration', () => {
    it('should properly integrate all dependencies', async () => {
      const mockDto = new RegisterDto('John', 'Doe', 'john.doe@example.com', 'SecurePass123!');
      const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
      
      (RegisterValidator.validate as jest.Mock).mockReturnValue(mockDto);
      mockRegisterUser.execute.mockResolvedValue(mockUser);

      authController.register(mockRequest as Request, mockResponse as Response, mockNext);

      // Verify the complete flow
      expect(RegisterValidator.validate).toHaveBeenCalledWith(mockRequest.body);
      expect(RegisterUser).toHaveBeenCalledWith(mockDatasource);
      expect(mockRegisterUser.execute).toHaveBeenCalledWith(mockDto);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUser,
        meta: {
          requestId: expect.any(String),
          timestamp: expect.any(String),
          version: '1.0.0'
        }
      });
      expect(mockNext).not.toHaveBeenCalled(); // No errors should be passed to next
    });
  });

  describe('login method', () => {
    beforeEach(() => {
      // Mock login request
      mockRequest = {
        body: {
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        }
      };
    });

    describe('Successful login', () => {
      beforeEach(() => {
        const mockDto = new LoginDto('john.doe@example.com', 'SecurePass123!');
        (LoginValidator.validate as jest.Mock).mockReturnValue(mockDto);
      });

      it('should validate request body', () => {
        const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
        const mockAuthUser = AuthUserEntity.createFrom({
          user: mockUser,
          data: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token'
          }
        });
        mockLoginUser.execute.mockResolvedValue(mockAuthUser);

        authController.login(mockRequest as Request, mockResponse as Response, mockNext);

        expect(LoginValidator.validate).toHaveBeenCalledTimes(1);
        expect(LoginValidator.validate).toHaveBeenCalledWith(mockRequest.body);
      });

      it('should create LoginUser use case with datasource', () => {
        const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
        const mockAuthUser = AuthUserEntity.createFrom({
          user: mockUser,
          data: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token'
          }
        });
        mockLoginUser.execute.mockResolvedValue(mockAuthUser);

        authController.login(mockRequest as Request, mockResponse as Response, mockNext);

        expect(LoginUser).toHaveBeenCalledTimes(1);
        expect(LoginUser).toHaveBeenCalledWith(mockDatasource);
      });

      it('should execute use case with validated DTO', async () => {
        const mockDto = new LoginDto('john.doe@example.com', 'SecurePass123!');
        const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
        const mockAuthUser = AuthUserEntity.createFrom({
          user: mockUser,
          data: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token'
          }
        });
        
        (LoginValidator.validate as jest.Mock).mockReturnValue(mockDto);
        mockLoginUser.execute.mockResolvedValue(mockAuthUser);

        authController.login(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockLoginUser.execute).toHaveBeenCalledTimes(1);
        expect(mockLoginUser.execute).toHaveBeenCalledWith(mockDto);
      });

      it('should return auth user data on successful login', async () => {
        const mockDto = new LoginDto('john.doe@example.com', 'SecurePass123!');
        const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
        const mockAuthUser = AuthUserEntity.createFrom({
          user: mockUser,
          data: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token'
          }
        });
        
        (LoginValidator.validate as jest.Mock).mockReturnValue(mockDto);
        mockLoginUser.execute.mockResolvedValue(mockAuthUser);

        authController.login(mockRequest as Request, mockResponse as Response, mockNext);

        // Wait for promise to resolve
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith({
          status: 'success',
          data: mockAuthUser,
          meta: {
            requestId: expect.any(String),
            timestamp: expect.any(String),
            version: '1.0.0'
          }
        });
      });
    });

    describe('Validation errors', () => {
      it('should call next with validation error when validation fails', () => {
        const validationError = new Error('Invalid email format');
        (LoginValidator.validate as jest.Mock).mockImplementation(() => {
          throw validationError;
        });

        authController.login(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(validationError);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it('should not execute use case when validation fails', () => {
        const validationError = new Error('Invalid credentials');
        (LoginValidator.validate as jest.Mock).mockImplementation(() => {
          throw validationError;
        });

        authController.login(mockRequest as Request, mockResponse as Response, mockNext);

        expect(LoginUser).not.toHaveBeenCalled();
        expect(mockLoginUser.execute).not.toHaveBeenCalled();
      });
    });

    describe('Use case execution errors', () => {
      beforeEach(() => {
        const mockDto = new LoginDto('john.doe@example.com', 'SecurePass123!');
        (LoginValidator.validate as jest.Mock).mockReturnValue(mockDto);
      });

      it('should call next with use case error', async () => {
        const error = new Error('Invalid credentials');
        mockLoginUser.execute.mockRejectedValue(error);

        authController.login(mockRequest as Request, mockResponse as Response, mockNext);

        // Wait for promise to reject
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
      });

      it('should handle authentication errors', async () => {
        const error = new Error('User not found');
        mockLoginUser.execute.mockRejectedValue(error);

        authController.login(mockRequest as Request, mockResponse as Response, mockNext);

        // Wait for promise to reject
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('Method binding', () => {
    it('should maintain correct context when login method is extracted', () => {
      const { login } = authController;
      const mockDto = new LoginDto('john.doe@example.com', 'SecurePass123!');
      const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
      const mockAuthUser = AuthUserEntity.createFrom({
        user: mockUser,
        data: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token'
        }
      });
      
      (LoginValidator.validate as jest.Mock).mockReturnValue(mockDto);
      mockLoginUser.execute.mockResolvedValue(mockAuthUser);

      // Should work even when method is extracted from instance
      expect(() => login(mockRequest as Request, mockResponse as Response, mockNext)).not.toThrow();
      expect(LoginUser).toHaveBeenCalledWith(mockDatasource);
    });
  });
});