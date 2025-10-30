import { Request, Response, NextFunction } from "express";
import { ErrorMiddleware } from "../error.middleware";
import { ErrorHandler } from "@/domain/errors/error-handler";
import { BadRequestError } from "@/domain/errors/bad-request-error";

// Mock LoggerService using the reusable mock
jest.mock("@/infrastructure/services/logger/logger.service", () => {
  // Import the reusable mock
  const mockModule = jest.requireActual("@/infrastructure/services/logger/__mocks__/logger.service");
  return {
    __esModule: true,
    default: mockModule.default,
  };
});

// Mock ErrorHandler
jest.mock("@/domain/errors/error-handler");
const mockErrorHandler = ErrorHandler as jest.Mocked<typeof ErrorHandler>;

// Import helpers after mocking
import { getMockLogger, getLoggerServiceMock, resetLoggerServiceMock } from "@/infrastructure/services/logger/__mocks__/logger.service";

describe("ErrorMiddleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn();
    mockNext = jest.fn();

    mockReq = {
      requestId: "test-request-id",
    };
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };

    jest.clearAllMocks();
    resetLoggerServiceMock(); // Reset the reusable mock
  });

  describe("handleError", () => {
    it("should handle error and return proper response", () => {
      // Arrange
      const error = new BadRequestError("Test error");
      const expectedResponse = {
        status: "error" as const,
        code: 400,
        errors: [{ message: "Test error" }],
        meta: {
          requestId: "test-request-id",
          timestamp: expect.any(String),
          version: "1.0.0",
        },
      };

      mockErrorHandler.handle.mockReturnValue(expectedResponse);

      // Act
      ErrorMiddleware.handleError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Use the reusable mock helpers
      const mockLogger = getMockLogger();
      const loggerServiceMock = getLoggerServiceMock();

      // Assert
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(
        error,
        "test-request-id",
        "1.0.0",
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(expectedResponse);
      expect(loggerServiceMock).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it("should handle generic error", () => {
      // Arrange
      const error = new Error("Generic error");
      const expectedResponse = {
        status: "error" as const,
        code: 500,
        errors: [{ message: "Something went wrong" }],
        meta: {
          requestId: "test-request-id",
          timestamp: expect.any(String),
          version: "1.0.0",
        },
      };

      mockErrorHandler.handle.mockReturnValue(expectedResponse);

      // Act
      ErrorMiddleware.handleError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Use the reusable mock helpers
      const mockLogger = getMockLogger();
      const loggerServiceMock = getLoggerServiceMock();

      // Assert
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(
        error,
        "test-request-id",
        "1.0.0",
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expectedResponse);
      expect(loggerServiceMock).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining(error),
      );
    });

    it("should handle unknown error types", () => {
      // Arrange
      const error = "string error";
      const expectedResponse = {
        status: "error" as const,
        code: 500,
        errors: [{ message: "Something went wrong" }],
        meta: {
          requestId: "test-request-id",
          timestamp: expect.any(String),
          version: "1.0.0",
        },
      };

      mockErrorHandler.handle.mockReturnValue(expectedResponse);

      // Act
      ErrorMiddleware.handleError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Use the reusable mock helpers
      const mockLogger = getMockLogger();

      // Assert
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(
        error,
        "test-request-id",
        "1.0.0",
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expectedResponse);
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it("should handle null error", () => {
      // Arrange
      const error = null;
      const expectedResponse = {
        status: "error" as const,
        code: 500,
        errors: [{ message: "Something went wrong" }],
        meta: {
          requestId: "test-request-id",
          timestamp: expect.any(String),
          version: "1.0.0",
        },
      };

      mockErrorHandler.handle.mockReturnValue(expectedResponse);

      // Act
      ErrorMiddleware.handleError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Use the reusable mock helpers
      const mockLogger = getMockLogger();

      // Assert
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(
        error,
        "test-request-id",
        "1.0.0",
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expectedResponse);
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it("should handle different status codes", () => {
      // Arrange
      const error = new Error("Test");
      const expectedResponse = {
        status: "error" as const,
        code: 422,
        errors: [{ message: "Validation failed" }],
        meta: {
          requestId: "test-request-id",
          timestamp: expect.any(String),
          version: "1.0.0",
        },
      };

      mockErrorHandler.handle.mockReturnValue(expectedResponse);

      // Act
      ErrorMiddleware.handleError(
        error,
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Use the reusable mock helpers
      const mockLogger = getMockLogger();

      // Assert
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(
        error,
        "test-request-id",
        "1.0.0",
      );
      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockJson).toHaveBeenCalledWith(expectedResponse);
      expect(mockLogger.error).not.toHaveBeenCalledTimes(1);
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});
