import { Request, Response, NextFunction } from "express";
import { AuthMiddleware } from "../auth.middleware";
import { UnauthorizedError } from "@/domain/errors/unauthorized-error";
import { jwtVerify } from "jose";

// Mock jose with explicit jwtVerify function
jest.mock("jose", () => ({ jwtVerify: jest.fn() }));

// Mock LoggerService using the reusable mock
jest.mock("@/infrastructure/services/logger/logger.service", () => {
  // Import the reusable mock
  const mockModule = jest.requireActual("@/infrastructure/services/logger/__mocks__/logger.service");
  return {
    __esModule: true,
    default: mockModule.default,
  };
});

// Import helpers after mocking
import { getMockLogger, getLoggerServiceMock, resetLoggerServiceMock } from "@/infrastructure/services/logger/__mocks__/logger.service";

describe("AuthMiddleware", () => {
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
      headers: {},
    } as Partial<Request>;
    mockRes = {
      status: mockStatus,
      json: mockJson,
    } as Partial<Response>;

    jest.clearAllMocks();
    resetLoggerServiceMock(); // Reset the reusable mock
    process.env.JWT_SECRET =
      process.env.JWT_SECRET || "abcdefghijklmnopqrstuvwxyz012345"; // ensure length >= 32
  });

  describe("verify", () => {
    it("should call next with UnauthorizedError when Authorization header is missing", async () => {
      await AuthMiddleware.verify(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      const err = (mockNext as jest.Mock).mock.calls[0][0];
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.message).toBe("Authorization header is required");
      expect(err.field).toBe("authorization");
      expect(err.code).toBe("MISSING_AUTH_HEADER");
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });

    it("should call next with UnauthorizedError when Authorization format is invalid", async () => {
      mockReq.headers = { authorization: "Basic abc" } as any;

      await AuthMiddleware.verify(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      const err = (mockNext as jest.Mock).mock.calls[0][0];
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.message).toBe(
        'Authorization header must start with "Bearer "',
      );
      expect(err.field).toBe("authorization");
      expect(err.code).toBe("INVALID_AUTH_FORMAT");
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });

    it("should call next with UnauthorizedError when token is empty", async () => {
      mockReq.headers = { authorization: "Bearer " } as any;

      await AuthMiddleware.verify(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      const err = (mockNext as jest.Mock).mock.calls[0][0];
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.message).toBe("Bearer token cannot be empty");
      expect(err.field).toBe("token");
      expect(err.code).toBe("MISSING_TOKEN");
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });

    it("should call next on valid token", async () => {
      mockReq.headers = { authorization: "Bearer valid-token" } as any;
      (jwtVerify as jest.Mock).mockResolvedValueOnce({
        payload: { sub: "u1" },
      });

      await AuthMiddleware.verify(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      // Use the reusable mock helpers
      const mockLogger = getMockLogger();
      const loggerServiceMock = getLoggerServiceMock();

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();

      // Assert jwtVerify was called with HS256 and proper token
      const calls = (jwtVerify as jest.Mock).mock.calls;
      expect(calls[0][0]).toBe("valid-token");
      expect(calls[0][1]).toBeInstanceOf(Uint8Array);
      expect(calls[0][2]).toEqual({ algorithms: ["HS256"] });

      // Assert LoggerService constructor was called
      expect(loggerServiceMock).toHaveBeenCalledTimes(1);
      
      // Assert LoggerService.debug called using reusable mock
      expect(mockLogger.debug).toHaveBeenCalledTimes(1);
      const logArg = (mockLogger.debug as jest.Mock).mock.calls[0][0];
      expect(logArg.service).toBe("auth-middleware");
    });

    it("should call next with TOKEN_EXPIRED on expired token", async () => {
      mockReq.headers = { authorization: "Bearer expired-token" } as any;
      (jwtVerify as jest.Mock).mockRejectedValueOnce(
        new Error("token expired"),
      );

      await AuthMiddleware.verify(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      const err = (mockNext as jest.Mock).mock.calls[0][0];
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.code).toBe("TOKEN_EXPIRED");
    });

    it("should call next with INVALID_SIGNATURE on bad signature", async () => {
      mockReq.headers = { authorization: "Bearer badsig-token" } as any;
      (jwtVerify as jest.Mock).mockRejectedValueOnce(
        new Error("invalid signature"),
      );

      await AuthMiddleware.verify(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      const err = (mockNext as jest.Mock).mock.calls[0][0];
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.code).toBe("INVALID_SIGNATURE");
    });

    it("should call next with INVALID_TOKEN on malformed token", async () => {
      mockReq.headers = { authorization: "Bearer malformed" } as any;
      (jwtVerify as jest.Mock).mockRejectedValueOnce(new Error("malformed"));

      await AuthMiddleware.verify(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      const err = (mockNext as jest.Mock).mock.calls[0][0];
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.code).toBe("INVALID_TOKEN");
    });
  });

  describe("optionalVerify", () => {
    it("should call next when no Authorization header", async () => {
      await AuthMiddleware.optionalVerify(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });

    it("should call next when Authorization is not Bearer", async () => {
      mockReq.headers = { authorization: "Basic abc" } as any;

      await AuthMiddleware.optionalVerify(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });

    it("should delegate to verify when Bearer token is present", async () => {
      mockReq.headers = { authorization: "Bearer valid-token" } as any;

      await AuthMiddleware.optionalVerify(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });
});
