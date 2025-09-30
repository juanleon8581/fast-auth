import { Request, Response } from "express";
import { ResponseHelper } from "../response-helper";
import { ApiResponseBuilder } from "../api-response";

// Mock ApiResponseBuilder
jest.mock("../api-response");
const mockApiResponseBuilder = ApiResponseBuilder as jest.Mocked<typeof ApiResponseBuilder>;

describe("ResponseHelper", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      requestId: "test-request-id",
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("success method", () => {
    it("should call ApiResponseBuilder.success and send response with provided data and request", () => {
      const testData = { message: "Test successful" };
      const mockApiResponse = {
        status: "success" as const,
        data: testData,
        meta: {
          requestId: "test-request-id",
          timestamp: "2023-01-01T00:00:00.000Z",
          version: "1.0.0",
        },
      };

      mockApiResponseBuilder.success.mockReturnValue(mockApiResponse);

      ResponseHelper.success(
        mockResponse as Response,
        testData,
        mockRequest as Request
      );

      expect(mockApiResponseBuilder.success).toHaveBeenCalledWith(testData, {
        requestId: "test-request-id",
        timestamp: expect.any(String),
        version: "1.0.0",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockApiResponse);
    });

    it("should use default status code 200 when not provided", () => {
      const testData = { message: "Test successful" };
      const mockApiResponse = {
        status: "success" as const,
        data: testData,
        meta: {
          requestId: "test-request-id",
          timestamp: "2023-01-01T00:00:00.000Z",
          version: "1.0.0",
        },
      };

      mockApiResponseBuilder.success.mockReturnValue(mockApiResponse);

      ResponseHelper.success(
        mockResponse as Response,
        testData,
        mockRequest as Request
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should use custom status code when provided", () => {
      const testData = { message: "Test created" };
      const mockApiResponse = {
        status: "success" as const,
        data: testData,
        meta: {
          requestId: "test-request-id",
          timestamp: "2023-01-01T00:00:00.000Z",
          version: "1.0.0",
        },
      };

      mockApiResponseBuilder.success.mockReturnValue(mockApiResponse);

      ResponseHelper.success(
        mockResponse as Response,
        testData,
        mockRequest as Request,
        201
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it("should handle missing request object", () => {
      const testData = { message: "Test successful" };
      const mockApiResponse = {
        status: "success" as const,
        data: testData,
        meta: {
          requestId: "",
          timestamp: "2023-01-01T00:00:00.000Z",
          version: "1.0.0",
        },
      };

      mockApiResponseBuilder.success.mockReturnValue(mockApiResponse);

      ResponseHelper.success(mockResponse as Response, testData);

      expect(mockApiResponseBuilder.success).toHaveBeenCalledWith(testData, {
        requestId: "",
        timestamp: expect.any(String),
        version: "1.0.0",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockApiResponse);
    });

    it("should handle request without requestId", () => {
      const testData = { message: "Test successful" };
      const requestWithoutId = {} as Request;
      const mockApiResponse = {
        status: "success" as const,
        data: testData,
        meta: {
          requestId: "",
          timestamp: "2023-01-01T00:00:00.000Z",
          version: "1.0.0",
        },
      };

      mockApiResponseBuilder.success.mockReturnValue(mockApiResponse);

      ResponseHelper.success(mockResponse as Response, testData, requestWithoutId);

      expect(mockApiResponseBuilder.success).toHaveBeenCalledWith(testData, {
        requestId: "",
        timestamp: expect.any(String),
        version: "1.0.0",
      });
    });
  });

  describe("paginated method", () => {
    const testData = [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ];
    const pagination = { page: 1, limit: 10, total: 25 };

    it("should call ApiResponseBuilder.paginated and send response with provided data and request", () => {
      const mockApiResponse = {
        status: "success" as const,
        data: testData,
        meta: {
          requestId: "test-request-id",
          timestamp: "2023-01-01T00:00:00.000Z",
          version: "1.0.0",
          pagination: {
            ...pagination,
            totalPages: 3,
          },
        },
      };

      mockApiResponseBuilder.paginated.mockReturnValue(mockApiResponse);

      ResponseHelper.paginated(
        mockResponse as Response,
        testData,
        pagination,
        mockRequest as Request
      );

      expect(mockApiResponseBuilder.paginated).toHaveBeenCalledWith(
        testData,
        pagination,
        {
          requestId: "test-request-id",
          timestamp: expect.any(String),
          version: "1.0.0",
        }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockApiResponse);
    });

    it("should use default status code 200 when not provided", () => {
      const mockApiResponse = {
        status: "success" as const,
        data: testData,
        meta: {
          requestId: "test-request-id",
          timestamp: "2023-01-01T00:00:00.000Z",
          version: "1.0.0",
          pagination: {
            ...pagination,
            totalPages: 3,
          },
        },
      };

      mockApiResponseBuilder.paginated.mockReturnValue(mockApiResponse);

      ResponseHelper.paginated(
        mockResponse as Response,
        testData,
        pagination,
        mockRequest as Request
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should use custom status code when provided", () => {
      const mockApiResponse = {
        status: "success" as const,
        data: testData,
        meta: {
          requestId: "test-request-id",
          timestamp: "2023-01-01T00:00:00.000Z",
          version: "1.0.0",
          pagination: {
            ...pagination,
            totalPages: 3,
          },
        },
      };

      mockApiResponseBuilder.paginated.mockReturnValue(mockApiResponse);

      ResponseHelper.paginated(
        mockResponse as Response,
        testData,
        pagination,
        mockRequest as Request,
        206
      );

      expect(mockResponse.status).toHaveBeenCalledWith(206);
    });

    it("should handle missing request object", () => {
      const mockApiResponse = {
        status: "success" as const,
        data: testData,
        meta: {
          requestId: "",
          timestamp: "2023-01-01T00:00:00.000Z",
          version: "1.0.0",
          pagination: {
            ...pagination,
            totalPages: 3,
          },
        },
      };

      mockApiResponseBuilder.paginated.mockReturnValue(mockApiResponse);

      ResponseHelper.paginated(mockResponse as Response, testData, pagination);

      expect(mockApiResponseBuilder.paginated).toHaveBeenCalledWith(
        testData,
        pagination,
        {
          requestId: "",
          timestamp: expect.any(String),
          version: "1.0.0",
        }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockApiResponse);
    });

    it("should handle request without requestId", () => {
      const requestWithoutId = {} as Request;
      const mockApiResponse = {
        status: "success" as const,
        data: testData,
        meta: {
          requestId: "",
          timestamp: "2023-01-01T00:00:00.000Z",
          version: "1.0.0",
          pagination: {
            ...pagination,
            totalPages: 3,
          },
        },
      };

      mockApiResponseBuilder.paginated.mockReturnValue(mockApiResponse);

      ResponseHelper.paginated(
        mockResponse as Response,
        testData,
        pagination,
        requestWithoutId
      );

      expect(mockApiResponseBuilder.paginated).toHaveBeenCalledWith(
        testData,
        pagination,
        {
          requestId: "",
          timestamp: expect.any(String),
          version: "1.0.0",
        }
      );
    });

    it("should handle different pagination scenarios", () => {
      const differentPagination = { page: 2, limit: 5, total: 12 };
      const mockApiResponse = {
        status: "success" as const,
        data: testData,
        meta: {
          requestId: "test-request-id",
          timestamp: "2023-01-01T00:00:00.000Z",
          version: "1.0.0",
          pagination: {
            ...differentPagination,
            totalPages: 3,
          },
        },
      };

      mockApiResponseBuilder.paginated.mockReturnValue(mockApiResponse);

      ResponseHelper.paginated(
        mockResponse as Response,
        testData,
        differentPagination,
        mockRequest as Request
      );

      expect(mockApiResponseBuilder.paginated).toHaveBeenCalledWith(
        testData,
        differentPagination,
        {
          requestId: "test-request-id",
          timestamp: expect.any(String),
          version: "1.0.0",
        }
      );
    });
  });
});