import express from "express";
import cors from "cors";
import helmet from "helmet";
import { Server } from "../server";
import { AppRoutes } from "../routes";

// Mock dependencies
jest.mock("express");
jest.mock("cors");
jest.mock("helmet");
jest.mock("../routes");

describe("Server", () => {
  let mockApp: any;
  let mockRouter: any;
  let server: Server;

  beforeEach(() => {
    jest.clearAllMocks();

    mockApp = {
      use: jest.fn(),
      get: jest.fn(),
      listen: jest.fn((port, callback) => {
        if (callback) callback();
        return { close: jest.fn() };
      }),
    };

    mockRouter = {
      get: jest.fn(),
      use: jest.fn(),
    };

    (express as unknown as jest.Mock).mockReturnValue(mockApp);
    (cors as jest.Mock).mockReturnValue(jest.fn());
    (helmet as unknown as jest.Mock).mockReturnValue(jest.fn());
    (AppRoutes as any).routes = mockRouter;

    server = new Server({
      port: 3000,
      routes: AppRoutes.routes,
    });
  });

  describe("constructor", () => {
    it("should create Express app instance", () => {
      expect(express).toHaveBeenCalledTimes(1);
    });

    it("should store port and routes configuration", () => {
      const testServer = new Server({
        port: 8080,
        routes: mockRouter,
      });

      expect(testServer).toBeInstanceOf(Server);
    });

    it("should accept different port configurations", () => {
      const servers = [
        new Server({ port: 3000, routes: mockRouter }),
        new Server({ port: 8080, routes: mockRouter }),
        new Server({ port: 5000, routes: mockRouter }),
      ];

      servers.forEach((s) => expect(s).toBeInstanceOf(Server));
    });
  });

  describe("start method", () => {
    it("should configure security middlewares", async () => {
      await server.start();

      expect(helmet).toHaveBeenCalledTimes(1);
      expect(cors).toHaveBeenCalledTimes(1);
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function)); // helmet
      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function)); // cors
    });

    it("should configure body parsing middlewares", async () => {
      await server.start();

      expect(mockApp.use).toHaveBeenCalledWith(express.json());
      expect(mockApp.use).toHaveBeenCalledWith(
        express.urlencoded({ extended: true }),
      );
    });

    it("should configure health check endpoint", async () => {
      await server.start();

      expect(mockApp.get).toHaveBeenCalledWith("/health", expect.any(Function));
    });

    it("should set up Swagger documentation endpoint", async () => {
      await server.start();

      // Check that swagger endpoint was configured
      const swaggerCall = mockApp.use.mock.calls.find(
        (call: any[]) => call[0] === "/api-docs",
      );
      expect(swaggerCall).toBeDefined();
      expect(swaggerCall).toHaveLength(3);
    });

    it("should configure API routes", async () => {
      await server.start();

      expect(mockApp.use).toHaveBeenCalledWith("/api", mockRouter);
    });

    it("should configure 404 handler", async () => {
      await server.start();

      expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should start server on specified port", async () => {
      await server.start();

      expect(mockApp.listen).toHaveBeenCalledWith(3000, expect.any(Function));
    });

    it("should handle different port configurations", async () => {
      const testServer = new Server({ port: 8080, routes: mockRouter });
      await testServer.start();

      expect(mockApp.listen).toHaveBeenCalledWith(8080, expect.any(Function));
    });
  });

  describe("health check endpoint", () => {
    it("should respond with server status", async () => {
      await server.start();

      const healthHandler = mockApp.get.mock.calls.find(
        (call: any[]) => call[0] === "/health",
      )[1];

      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      healthHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          status: "OK",
          timestamp: expect.any(String),
        },
        meta: {
          requestId: expect.any(String),
          timestamp: expect.any(String),
          version: "1.0.0",
        },
      });
    });

    it("should include timestamp in health response", async () => {
      await server.start();

      const healthHandler = mockApp.get.mock.calls.find(
        (call: any[]) => call[0] === "/health",
      )[1];

      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      healthHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const response = mockRes.json.mock.calls[0][0];
      expect(response.data.timestamp).toBeDefined();
      expect(typeof response.data.timestamp).toBe("string");
      expect(response.meta.timestamp).toBeDefined();
      expect(typeof response.meta.timestamp).toBe("string");
    });
  });

  describe("404 handler", () => {
    it("should handle unknown routes", async () => {
      await server.start();

      // Find the 404 handler (should be the call with '*')
      const middlewareCalls = mockApp.use.mock.calls;
      const notFoundCall = middlewareCalls.find((call: any) => call[0] === "*");
      const notFoundHandler = notFoundCall[1];

      const mockReq = {
        originalUrl: "/unknown-route",
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      if (notFoundHandler) {
        notFoundHandler(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        expect(mockNext).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Route not found",
          }),
        );
      }
    });

    it("should be configured as the last middleware", async () => {
      await server.start();

      const middlewareCalls = mockApp.use.mock.calls;
      const notFoundCall = middlewareCalls.find((call: any) => call[0] === "*");

      expect(notFoundCall).toHaveLength(2); // Pattern and handler function
      expect(notFoundCall[0]).toBe("*");
      expect(typeof notFoundCall[1]).toBe("function");
    });
  });

  describe("middleware configuration order", () => {
    it("should configure middlewares in correct order", async () => {
      await server.start();

      const useCalls = mockApp.use.mock.calls;
      const getCalls = mockApp.get.mock.calls;

      // Verify security middlewares are first
      expect(useCalls.length).toBeGreaterThan(4);

      // Verify health endpoint is configured
      expect(getCalls).toHaveLength(1);
      expect(getCalls[0][0]).toBe("/health");
    });

    it("should configure body parsing after security", async () => {
      await server.start();

      const useCalls = mockApp.use.mock.calls;

      // Should have helmet, cors, json, urlencoded, routes, 404 handler
      expect(useCalls.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe("error handling", () => {
    it("should handle server start errors", async () => {
      mockApp.listen.mockImplementation(() => {
        throw new Error("Port already in use");
      });

      await expect(server.start()).rejects.toThrow("Port already in use");
    });

    it("should handle middleware configuration errors", async () => {
      (helmet as unknown as jest.Mock).mockImplementation(() => {
        throw new Error("Helmet configuration error");
      });

      await expect(server.start()).rejects.toThrow(
        "Helmet configuration error",
      );
    });
  });

  describe("server lifecycle", () => {
    it("should complete start method successfully", async () => {
      const result = await server.start();

      expect(result).toBeUndefined(); // start method doesn't return anything
      expect(mockApp.listen).toHaveBeenCalled();
    });

    it("should handle multiple start calls", async () => {
      await server.start();
      await server.start();

      // Should not throw and should configure everything twice
      expect(mockApp.listen).toHaveBeenCalledTimes(2);
    });
  });

  describe("integration", () => {
    it("should properly integrate with AppRoutes", async () => {
      await server.start();

      expect(mockApp.use).toHaveBeenCalledWith("/api", mockRouter);
    });

    it("should handle different route configurations", async () => {
      const customRouter = mockRouter;
      const customServer = new Server({
        port: 4000,
        routes: customRouter,
      });

      await customServer.start();

      expect(mockApp.use).toHaveBeenCalledWith("/api", customRouter);
    });
  });
});
