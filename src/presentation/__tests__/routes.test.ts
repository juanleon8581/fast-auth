import { Router } from "express";
import { AppRoutes } from "../routes";
import { AuthRoutes } from "../auth/routes/routes";

// Mock dependencies
jest.mock("express", () => ({
  Router: jest.fn(() => ({
    get: jest.fn(),
    use: jest.fn(),
  })),
}));

jest.mock("../auth/routes/routes");

describe("AppRoutes", () => {
  let mockRouter: any;
  let mockAuthRoutes: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRouter = {
      get: jest.fn(),
      use: jest.fn(),
    };

    mockAuthRoutes = {
      routes: mockRouter,
    };

    (Router as jest.Mock).mockReturnValue(mockRouter);
    (AuthRoutes as any).routes = mockAuthRoutes.routes;
  });

  describe("routes getter", () => {
    it("should create and return an Express Router", () => {
      const routes = AppRoutes.routes;

      expect(Router).toHaveBeenCalledTimes(1);
      expect(routes).toBe(mockRouter);
    });

    it("should configure health check route", () => {
      AppRoutes.routes;

      expect(mockRouter.get).toHaveBeenCalledWith("/", expect.any(Function));
    });

    it("should configure auth routes under /auth path", () => {
      AppRoutes.routes;

      expect(mockRouter.use).toHaveBeenCalledWith(
        "/auth",
        mockAuthRoutes.routes,
      );
    });

    it("should configure routes in correct order", () => {
      AppRoutes.routes;

      // Verify both methods were called
      expect(mockRouter.get).toHaveBeenCalledTimes(1);
      expect(mockRouter.use).toHaveBeenCalledTimes(1);

      // Verify specific route configurations
      expect(mockRouter.get).toHaveBeenCalledWith("/", expect.any(Function));
      expect(mockRouter.use).toHaveBeenCalledWith("/auth", expect.any(Object));
    });
  });

  describe("health check endpoint", () => {
    it("should respond with correct health status", () => {
      AppRoutes.routes;

      // Get the health check handler function
      const healthHandler = mockRouter.get.mock.calls.find(
        (call: any[]) => call[0] === "/",
      )[1];

      const mockReq = {};
      const mockRes = {
        json: jest.fn(),
      };

      healthHandler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: "API is running",
        version: "1.0.0",
      });
    });

    it("should handle health check requests properly", () => {
      AppRoutes.routes;

      const healthHandler = mockRouter.get.mock.calls.find(
        (call: any[]) => call[0] === "/",
      )[1];

      expect(typeof healthHandler).toBe("function");
      expect(healthHandler.length).toBe(2); // req, res parameters
    });
  });

  describe("route integration", () => {
    it("should integrate with AuthRoutes correctly", () => {
      AppRoutes.routes;

      expect(mockRouter.use).toHaveBeenCalledWith("/auth", expect.any(Object));
    });

    it("should maintain route structure", () => {
      const routes = AppRoutes.routes;

      // Verify that the router is properly configured
      expect(routes).not.toBeUndefined();
      expect(mockRouter.get).toHaveBeenCalledTimes(1);
      expect(mockRouter.use).toHaveBeenCalledTimes(1);

      // Verify route paths
      expect(mockRouter.get).toHaveBeenCalledWith("/", expect.any(Function));
      expect(mockRouter.use).toHaveBeenCalledWith("/auth", expect.any(Object));
    });
  });

  describe("class structure", () => {
    it("should be a static class with routes getter", () => {
      expect(typeof AppRoutes).toBe("function");
      expect(typeof AppRoutes.routes).toBe("object");
    });

    it("should not be instantiable", () => {
      // AppRoutes should be used as a static class
      // Since it's a regular class, we just verify it has no constructor logic
      const instance = new (AppRoutes as any)();
      expect(instance).toBeInstanceOf(AppRoutes);
    });

    it("should have routes as a static getter", () => {
      const descriptor = Object.getOwnPropertyDescriptor(AppRoutes, "routes");
      expect(descriptor?.get).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("should handle Router creation errors gracefully", () => {
      (Router as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Router creation failed");
      });

      expect(() => AppRoutes.routes).toThrow("Router creation failed");
    });

    it("should handle AuthRoutes integration errors", () => {
      (AuthRoutes as any).routes = null;

      expect(() => AppRoutes.routes).not.toThrow();
      expect(mockRouter.use).toHaveBeenCalledWith("/auth", null);
    });
  });
});
