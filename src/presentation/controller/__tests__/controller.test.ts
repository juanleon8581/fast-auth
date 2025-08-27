import { Request, Response } from 'express';
import { AuthController } from '../controller';
import { RegisterDto } from '@/domain/dtos/register.dto';
import { AuthRepository } from '@/domain/repositories/auth.repository';
import { RegisterUser } from '@/domain/use-cases/register-user';
import { RegisterValidator } from '@/infrastructure/validators/register.validator';
import { UserEntity } from '@/domain/entities/user.entity';

// Mock dependencies
jest.mock('@/domain/use-cases/register-user');
jest.mock('@/infrastructure/validators/register.validator');

describe('AuthController', () => {
  let authController: AuthController;
  let mockDatasource: jest.Mocked<AuthRepository>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockRegisterUser: jest.Mocked<RegisterUser>;

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

    // Mock RegisterUser
    mockRegisterUser = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RegisterUser>;
    (RegisterUser as jest.Mock).mockImplementation(() => mockRegisterUser);

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
  });

  describe('register method', () => {
    describe('Successful registration', () => {
      beforeEach(() => {
        const mockDto = new RegisterDto('John', 'Doe', 'john.doe@example.com', 'SecurePass123!');
        (RegisterValidator.validate as jest.Mock).mockReturnValue([null, mockDto]);
      });

      it('should validate request body', () => {
        const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
        mockRegisterUser.execute.mockResolvedValue(mockUser);

        authController.register(mockRequest as Request, mockResponse as Response);

        expect(RegisterValidator.validate).toHaveBeenCalledTimes(1);
        expect(RegisterValidator.validate).toHaveBeenCalledWith(mockRequest.body);
      });

      it('should create RegisterUser use case with datasource', () => {
        const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
        mockRegisterUser.execute.mockResolvedValue(mockUser);

        authController.register(mockRequest as Request, mockResponse as Response);

        expect(RegisterUser).toHaveBeenCalledTimes(1);
        expect(RegisterUser).toHaveBeenCalledWith(mockDatasource);
      });

      it('should execute use case with validated DTO', async () => {
        const mockDto = new RegisterDto('John', 'Doe', 'john.doe@example.com', 'SecurePass123!');
        const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
        
        (RegisterValidator.validate as jest.Mock).mockReturnValue([null, mockDto]);
        mockRegisterUser.execute.mockResolvedValue(mockUser);

        authController.register(mockRequest as Request, mockResponse as Response);

        expect(mockRegisterUser.execute).toHaveBeenCalledTimes(1);
        expect(mockRegisterUser.execute).toHaveBeenCalledWith(mockDto);
      });

      it('should return user data on successful registration', async () => {
        const mockDto = new RegisterDto('John', 'Doe', 'john.doe@example.com', 'SecurePass123!');
        const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
        
        (RegisterValidator.validate as jest.Mock).mockReturnValue([null, mockDto]);
        mockRegisterUser.execute.mockResolvedValue(mockUser);

        authController.register(mockRequest as Request, mockResponse as Response);

        // Wait for promise to resolve
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
      });
    });

    describe('Validation errors', () => {
      it('should return 400 status when validation fails', () => {
        const validationError = { message: 'Invalid email format' };
        (RegisterValidator.validate as jest.Mock).mockReturnValue([validationError, null]);

        const result = authController.register(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(validationError);
        expect(result).toBe(mockResponse);
      });

      it('should return 400 status when DTO is null', () => {
        (RegisterValidator.validate as jest.Mock).mockReturnValue([null, null]);

        const result = authController.register(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(null);
        expect(result).toBe(mockResponse);
      });

      it('should not execute use case when validation fails', () => {
        const validationError = { message: 'Invalid data' };
        (RegisterValidator.validate as jest.Mock).mockReturnValue([validationError, null]);

        authController.register(mockRequest as Request, mockResponse as Response);

        expect(RegisterUser).not.toHaveBeenCalled();
        expect(mockRegisterUser.execute).not.toHaveBeenCalled();
      });
    });

    describe('Use case execution errors', () => {
      beforeEach(() => {
        const mockDto = new RegisterDto('John', 'Doe', 'john.doe@example.com', 'SecurePass123!');
        (RegisterValidator.validate as jest.Mock).mockReturnValue([null, mockDto]);
      });

      it('should handle use case errors with status code', async () => {
        const error = { message: 'User already exists', status: 409 };
        mockRegisterUser.execute.mockRejectedValue(error);

        authController.register(mockRequest as Request, mockResponse as Response);

        // Wait for promise to reject
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockResponse.status).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).toHaveBeenCalledWith(409);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(error);
      });

      it('should default to 400 status when error has no status', async () => {
        const error = { message: 'Unknown error' };
        mockRegisterUser.execute.mockRejectedValue(error);

        authController.register(mockRequest as Request, mockResponse as Response);

        // Wait for promise to reject
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockResponse.status).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(error);
      });

      it('should handle errors without status property', async () => {
        const error = new Error('Database connection failed');
        mockRegisterUser.execute.mockRejectedValue(error);

        authController.register(mockRequest as Request, mockResponse as Response);

        // Wait for promise to reject
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockResponse.status).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledTimes(1);
        expect(mockResponse.json).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('Method binding', () => {
    it('should maintain correct context when method is extracted', () => {
      const { register } = authController;
      const mockDto = new RegisterDto('John', 'Doe', 'john.doe@example.com', 'SecurePass123!');
      const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
      
      (RegisterValidator.validate as jest.Mock).mockReturnValue([null, mockDto]);
      mockRegisterUser.execute.mockResolvedValue(mockUser);

      // Should work even when method is extracted from instance
      expect(() => register(mockRequest as Request, mockResponse as Response)).not.toThrow();
      expect(RegisterUser).toHaveBeenCalledWith(mockDatasource);
    });
  });

  describe('Integration', () => {
    it('should properly integrate all dependencies', async () => {
      const mockDto = new RegisterDto('John', 'Doe', 'john.doe@example.com', 'SecurePass123!');
      const mockUser = new UserEntity('1', 'john.doe@example.com', 'John Doe', true, '+1234567890');
      
      (RegisterValidator.validate as jest.Mock).mockReturnValue([null, mockDto]);
      mockRegisterUser.execute.mockResolvedValue(mockUser);

      authController.register(mockRequest as Request, mockResponse as Response);

      // Verify the complete flow
      expect(RegisterValidator.validate).toHaveBeenCalledWith(mockRequest.body);
      expect(RegisterUser).toHaveBeenCalledWith(mockDatasource);
      expect(mockRegisterUser.execute).toHaveBeenCalledWith(mockDto);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });
  });
});