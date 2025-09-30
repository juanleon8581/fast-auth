import { ApiResponseBuilder, IApiResponseMeta } from "../api-response";

describe("ApiResponseBuilder", () => {
  const mockMeta: Partial<IApiResponseMeta> = {
    requestId: "test-request-id",
    timestamp: "2023-01-01T00:00:00.000Z",
    version: "1.0.0",
  };

  describe("success method", () => {
    it("should create a successful response with provided data and meta", () => {
      const data = { message: "Test successful" };
      const result = ApiResponseBuilder.success(data, mockMeta);

      expect(result).toEqual({
        status: "success",
        data,
        meta: {
          requestId: "test-request-id",
          timestamp: "2023-01-01T00:00:00.000Z",
          version: "1.0.0",
        },
      });
    });

    it("should create a successful response with default meta values when not provided", () => {
      const data = { message: "Test successful" };
      const result = ApiResponseBuilder.success(data);

      expect(result.status).toBe("success");
      expect(result.data).toEqual(data);
      expect(result.meta.requestId).toBe("");
      expect(result.meta.version).toBe("1.0.0");
      expect(result.meta.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("should handle partial meta information", () => {
      const data = { message: "Test successful" };
      const partialMeta = { requestId: "partial-id" };
      const result = ApiResponseBuilder.success(data, partialMeta);

      expect(result.meta.requestId).toBe("partial-id");
      expect(result.meta.version).toBe("1.0.0");
      expect(result.meta.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe("error method", () => {
    it("should create an error response with provided errors and meta", () => {
      const errors = [
        { message: "Test error", field: "testField", code: "TEST_ERROR" },
      ];
      const result = ApiResponseBuilder.error(400, errors, mockMeta);

      expect(result).toEqual({
        status: "error",
        code: 400,
        errors,
        meta: {
          requestId: "test-request-id",
          timestamp: "2023-01-01T00:00:00.000Z",
          version: "1.0.0",
        },
      });
    });

    it("should create an error response with default meta values when not provided", () => {
      const errors = [{ message: "Test error" }];
      const result = ApiResponseBuilder.error(500, errors);

      expect(result.status).toBe("error");
      expect(result.code).toBe(500);
      expect(result.errors).toEqual(errors);
      expect(result.meta.requestId).toBe("");
      expect(result.meta.version).toBe("1.0.0");
      expect(result.meta.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("should handle multiple errors", () => {
      const errors = [
        { message: "First error", field: "field1" },
        { message: "Second error", field: "field2", code: "SECOND_ERROR" },
      ];
      const result = ApiResponseBuilder.error(422, errors, mockMeta);

      expect(result.errors).toHaveLength(2);
      expect(result.errors).toEqual(errors);
      expect(result.code).toBe(422);
    });
  });

  describe("paginated method", () => {
    const mockData = [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ];

    it("should create a paginated response with provided data, pagination, and meta", () => {
      const pagination = { page: 1, limit: 10, total: 25 };
      const result = ApiResponseBuilder.paginated(mockData, pagination, mockMeta);

      expect(result).toEqual({
        status: "success",
        data: mockData,
        meta: {
          requestId: "test-request-id",
          timestamp: "2023-01-01T00:00:00.000Z",
          version: "1.0.0",
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3,
          },
        },
      });
    });

    it("should create a paginated response with default meta values when not provided", () => {
      const pagination = { page: 2, limit: 5, total: 12 };
      const result = ApiResponseBuilder.paginated(mockData, pagination);

      expect(result.status).toBe("success");
      expect(result.data).toEqual(mockData);
      expect(result.meta.requestId).toBe("");
      expect(result.meta.version).toBe("1.0.0");
      expect(result.meta.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result.meta.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 12,
        totalPages: 3,
      });
    });

    it("should calculate totalPages correctly for different scenarios", () => {
      // Test case 1: Exact division
      const pagination1 = { page: 1, limit: 5, total: 15 };
      const result1 = ApiResponseBuilder.paginated(mockData, pagination1);
      expect(result1.meta.pagination?.totalPages).toBe(3);

      // Test case 2: Division with remainder
      const pagination2 = { page: 1, limit: 4, total: 15 };
      const result2 = ApiResponseBuilder.paginated(mockData, pagination2);
      expect(result2.meta.pagination?.totalPages).toBe(4);

      // Test case 3: Single page
      const pagination3 = { page: 1, limit: 10, total: 5 };
      const result3 = ApiResponseBuilder.paginated(mockData, pagination3);
      expect(result3.meta.pagination?.totalPages).toBe(1);

      // Test case 4: Zero total
      const pagination4 = { page: 1, limit: 10, total: 0 };
      const result4 = ApiResponseBuilder.paginated([], pagination4);
      expect(result4.meta.pagination?.totalPages).toBe(0);
    });

    it("should handle partial meta information in paginated response", () => {
      const pagination = { page: 1, limit: 10, total: 25 };
      const partialMeta = { requestId: "paginated-id" };
      const result = ApiResponseBuilder.paginated(mockData, pagination, partialMeta);

      expect(result.meta.requestId).toBe("paginated-id");
      expect(result.meta.version).toBe("1.0.0");
      expect(result.meta.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result.meta.pagination).toBeDefined();
    });

    it("should preserve all pagination properties in the response", () => {
      const pagination = { page: 3, limit: 7, total: 50 };
      const result = ApiResponseBuilder.paginated(mockData, pagination, mockMeta);

      expect(result.meta.pagination).toEqual({
        page: 3,
        limit: 7,
        total: 50,
        totalPages: 8,
      });
    });
  });
});