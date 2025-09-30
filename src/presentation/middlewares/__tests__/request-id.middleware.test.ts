import { Request, Response, NextFunction } from "express";
import { RequestIdMiddleware } from "../request-id.middleware";

describe("RequestIdMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      setHeader: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("generate method", () => {
    it("should generate a unique requestId and add it to the request object", () => {
      RequestIdMiddleware.generate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest.requestId).toBeDefined();
      expect(typeof mockRequest.requestId).toBe("string");
      expect(mockRequest.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it("should set X-Request-ID header in the response", () => {
      RequestIdMiddleware.generate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "X-Request-ID",
        mockRequest.requestId
      );
    });

    it("should call next() to continue the middleware chain", () => {
      RequestIdMiddleware.generate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should generate different requestIds for different requests", () => {
      const mockRequest1: Partial<Request> = {};
      const mockRequest2: Partial<Request> = {};

      RequestIdMiddleware.generate(
        mockRequest1 as Request,
        mockResponse as Response,
        mockNext
      );

      RequestIdMiddleware.generate(
        mockRequest2 as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockRequest1.requestId).toBeDefined();
      expect(mockRequest2.requestId).toBeDefined();
      expect(mockRequest1.requestId).not.toBe(mockRequest2.requestId);
    });

    it("should handle the complete middleware flow correctly", () => {
      const setHeaderSpy = jest.fn();
      const nextSpy = jest.fn();

      mockResponse.setHeader = setHeaderSpy;

      RequestIdMiddleware.generate(
        mockRequest as Request,
        mockResponse as Response,
        nextSpy
      );

      // Verificar que se ejecutó todo el flujo
      expect(mockRequest.requestId).toBeDefined();
      expect(setHeaderSpy).toHaveBeenCalledWith("X-Request-ID", mockRequest.requestId);
      expect(nextSpy).toHaveBeenCalledTimes(1);
    });

    it("should work with real Express request/response objects structure", () => {
      // Simular una estructura más realista de req/res
      const mockReq = {
        method: "GET",
        url: "/test",
        headers: {},
      } as Request;

      const mockRes = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      RequestIdMiddleware.generate(mockReq, mockRes, mockNext);

      expect(mockReq.requestId).toBeDefined();
      expect(mockRes.setHeader).toHaveBeenCalledWith("X-Request-ID", mockReq.requestId);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});