import { Request, Response, NextFunction } from 'express';
import { ErrorMiddleware } from '../error.middleware';
import { ErrorHandler } from '@/domain/errors/error-handler';
import { BadRequestError } from '@/domain/errors/bad-request-error';

// Mock ErrorHandler
jest.mock('@/domain/errors/error-handler');
const mockErrorHandler = ErrorHandler as jest.Mocked<typeof ErrorHandler>;

describe('ErrorMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn();
    
    mockReq = {};
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('handleError', () => {
    it('should handle error and return proper response', () => {
      // Arrange
      const error = new BadRequestError('Test error');
      const expectedResponse = {
        status: "error" as const,
        code: 400,
        errors: [{ message: 'Test error' }]
      };
      
      mockErrorHandler.handle.mockReturnValue(expectedResponse);

      // Act
      ErrorMiddleware.handleError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(expectedResponse);
    });

    it('should handle generic error', () => {
      // Arrange
      const error = new Error('Generic error');
      const expectedResponse = {
        status: "error" as const,
        code: 500,
        errors: [{ message: 'Something went wrong' }]
      };
      
      mockErrorHandler.handle.mockReturnValue(expectedResponse);

      // Act
      ErrorMiddleware.handleError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expectedResponse);
    });

    it('should handle unknown error types', () => {
      // Arrange
      const error = 'string error';
      const expectedResponse = {
        status: "error" as const,
        code: 500,
        errors: [{ message: 'Something went wrong' }]
      };
      
      mockErrorHandler.handle.mockReturnValue(expectedResponse);

      // Act
      ErrorMiddleware.handleError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expectedResponse);
    });

    it('should handle null error', () => {
      // Arrange
      const error = null;
      const expectedResponse = {
        status: "error" as const,
        code: 500,
        errors: [{ message: 'Something went wrong' }]
      };
      
      mockErrorHandler.handle.mockReturnValue(expectedResponse);

      // Act
      ErrorMiddleware.handleError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expectedResponse);
    });

    it('should handle different status codes', () => {
      // Arrange
      const error = new Error('Test');
      const expectedResponse = {
        status: "error" as const,
        code: 422,
        errors: [{ message: 'Validation failed' }]
      };
      
      mockErrorHandler.handle.mockReturnValue(expectedResponse);

      // Act
      ErrorMiddleware.handleError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // Assert
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockJson).toHaveBeenCalledWith(expectedResponse);
    });
  });
});