import { Router } from "express";
import { AuthRoutes } from "../routes";
import { AuthDatasource } from "@/infrastructure/datasources/auth.datasource";
import { AuthClient } from "@/infrastructure/config/auth.client";
import { AuthController } from "@/presentation/controller/controller";

// Mock dependencies
jest.mock("@/infrastructure/datasources/auth.datasource");
jest.mock("@/infrastructure/config/auth.client");
jest.mock("@/presentation/controller/controller");

describe("AuthRoutes", () => {
  let mockRouter: jest.Mocked<Router>;
  let mockAuthDatasource: jest.Mocked<AuthDatasource>;
  let mockAuthController: jest.Mocked<AuthController>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock Router methods
    mockRouter = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      use: jest.fn(),
      patch: jest.fn(),
    } as any;

    // Mock Router constructor
    (Router as jest.Mock) = jest.fn(() => mockRouter);

    // Mock AuthDatasource
    mockAuthDatasource = {} as jest.Mocked<AuthDatasource>;
    (AuthDatasource as jest.Mock).mockImplementation(() => mockAuthDatasource);

    // Mock AuthController
    mockAuthController = {
      register: jest.fn(),
    } as unknown as jest.Mocked<AuthController>;
    (AuthController as jest.Mock).mockImplementation(() => mockAuthController);
  });

  describe("routes getter", () => {
    it("should be a static method", () => {
      expect(typeof AuthRoutes.routes).toBe("object");
      expect(AuthRoutes.routes).toBeInstanceOf(Object);
    });

    it("should create a new Router instance", () => {
      AuthRoutes.routes;
      expect(Router).toHaveBeenCalledTimes(1);
      expect(Router).toHaveBeenCalledWith();
    });

    it("should create AuthDatasource with AuthClient", () => {
      AuthRoutes.routes;
      expect(AuthDatasource).toHaveBeenCalledTimes(1);
      expect(AuthDatasource).toHaveBeenCalledWith(AuthClient);
    });

    it("should create AuthController with datasource", () => {
      AuthRoutes.routes;
      expect(AuthController).toHaveBeenCalledTimes(1);
      expect(AuthController).toHaveBeenCalledWith(mockAuthDatasource);
    });

    it("should register POST /register route", () => {
      AuthRoutes.routes;
      expect(mockRouter.post).toHaveBeenCalledTimes(1);
      expect(mockRouter.post).toHaveBeenCalledWith(
        "/register",
        mockAuthController.register,
      );
    });

    it("should return the configured router", () => {
      const result = AuthRoutes.routes;
      expect(result).toBe(mockRouter);
    });
  });

  describe("Route Configuration", () => {
    it("should have correct route structure", () => {
      const routes = AuthRoutes.routes;

      // Verify that the router is properly configured
      expect(routes).not.toBeUndefined();
      expect(mockRouter.post).toHaveBeenCalledWith(
        "/register",
        expect.any(Function),
      );
    });

    it("should use controller methods as route handlers", () => {
      AuthRoutes.routes;

      // Verify that controller methods are used as handlers
      const postCalls = (mockRouter.post as jest.Mock).mock.calls;
      expect(postCalls[0][1]).toBe(mockAuthController.register);
    });
  });

  describe("Dependencies Integration", () => {
    it("should properly wire dependencies", () => {
      AuthRoutes.routes;

      // Verify the dependency chain
      expect(AuthDatasource).toHaveBeenCalledWith(AuthClient);
      expect(AuthController).toHaveBeenCalledWith(mockAuthDatasource);
    });

    it("should create new instances each time routes is accessed", () => {
      // Access routes multiple times
      AuthRoutes.routes;
      AuthRoutes.routes;

      // Verify new instances are created each time
      expect(Router).toHaveBeenCalledTimes(2);
      expect(AuthDatasource).toHaveBeenCalledTimes(2);
      expect(AuthController).toHaveBeenCalledTimes(2);
    });
  });

  describe("Route Methods", () => {
    it("should only define POST routes", () => {
      AuthRoutes.routes;

      // Verify only POST method is used
      expect(mockRouter.post).toHaveBeenCalledTimes(1);
      expect(mockRouter.get).not.toHaveBeenCalled();
      expect(mockRouter.put).not.toHaveBeenCalled();
      expect(mockRouter.delete).not.toHaveBeenCalled();
      expect(mockRouter.patch).not.toHaveBeenCalled();
    });

    it("should define register endpoint", () => {
      AuthRoutes.routes;

      const postCalls = (mockRouter.post as jest.Mock).mock.calls;
      const registerRoute = postCalls.find((call) => call[0] === "/register");

      expect(registerRoute).toBeDefined();
      expect(registerRoute[1]).toBe(mockAuthController.register);
    });
  });

  describe("Class Structure", () => {
    it("should be a class with static methods only", () => {
      expect(typeof AuthRoutes).toBe("function");
      expect(AuthRoutes.prototype.constructor).toBe(AuthRoutes);

      // Should not be instantiable (no instance methods expected)
      const instance = new AuthRoutes();
      expect(instance).toBeInstanceOf(AuthRoutes);
    });

    it("should have routes as a static getter", () => {
      const descriptor = Object.getOwnPropertyDescriptor(AuthRoutes, "routes");
      expect(descriptor).toBeDefined();
      expect(descriptor?.get).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle AuthDatasource creation errors gracefully", () => {
      (AuthDatasource as jest.Mock).mockImplementation(() => {
        throw new Error("Datasource creation failed");
      });

      expect(() => AuthRoutes.routes).toThrow("Datasource creation failed");
    });

    it("should handle AuthController creation errors gracefully", () => {
      (AuthController as jest.Mock).mockImplementation(() => {
        throw new Error("Controller creation failed");
      });

      expect(() => AuthRoutes.routes).toThrow("Controller creation failed");
    });
  });
});
