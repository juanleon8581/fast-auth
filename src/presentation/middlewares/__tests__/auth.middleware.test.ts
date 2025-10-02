import { Request, Response, NextFunction } from "express";
import { AuthMiddleware } from "../auth.middleware";
import { UnauthorizedError } from "@/domain/errors/unauthorized-error";

// Use jose mock from config tests
jest.mock("jose");

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
    process.env.JWT_SECRET = process.env.JWT_SECRET ||
      "abcdefghijklmnopqrstuvwxyz012345"; // ensure length >= 32
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
      expect(err.message).toBe('Authorization header must start with "Bearer "');
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

      await AuthMiddleware.verify(
        mockReq as Request,
        mockRes as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
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
