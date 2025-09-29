import { Router } from "express";
import { AuthRoutes } from "../routes";
import { AuthDatasource } from "@/infrastructure/datasources/auth.datasource";
import { AuthClient } from "@/infrastructure/config/auth.client";
import { AuthController } from "@/presentation/controller/controller";

// Mock dependencies
jest.mock("@/infrastructure/datasources/auth.datasource");
jest.mock("@/infrastructure/config/auth.client");
jest.mock("@/presentation/controller/controller");
jest.mock("@/presentation/middlewares/auth.middleware", () => ({
  authMiddleware: jest.fn((req, res, next) => next()),
}));

// Import the mocked authMiddleware
const { authMiddleware } = require("@/presentation/middlewares/auth.middleware");

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
    (AuthDatasource as unknown as jest.Mock).mockImplementation(
      () => mockAuthDatasource,
    );

    // Mock AuthController
    mockAuthController = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      updateUser: jest.fn(),
      updateUserPassword: jest.fn(),
      requestResetPasswordEmail: jest.fn(),
    } as unknown as jest.Mocked<AuthController>;
    (AuthController as unknown as jest.Mock).mockImplementation(
      () => mockAuthController,
    );
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
      expect(mockRouter.post).toHaveBeenCalledWith(
        "/register",
        mockAuthController.register,
      );
    });

    it("should register POST /login route", () => {
      AuthRoutes.routes;
      expect(mockRouter.post).toHaveBeenCalledWith(
        "/login",
        mockAuthController.login,
      );
    });

    it("should register POST /logout route with authMiddleware", () => {
      AuthRoutes.routes;
      expect(mockRouter.post).toHaveBeenCalledWith(
        "/logout",
        authMiddleware,
        mockAuthController.logout,
      );
    });

    it("should register PUT /update route with authMiddleware", () => {
      AuthRoutes.routes;
      expect(mockRouter.put).toHaveBeenCalledWith(
        "/update-user",
        authMiddleware,
        mockAuthController.updateUser,
      );
    });

    it("should register PUT /update-user-password route with authMiddleware", () => {
      AuthRoutes.routes;
      expect(mockRouter.put).toHaveBeenCalledWith(
        "/update-user-password",
        authMiddleware,
        mockAuthController.updateUserPassword,
      );
    });

    it("should register POST /request-reset-password-email route", () => {
      AuthRoutes.routes;
      expect(mockRouter.post).toHaveBeenCalledWith(
        "/request-reset-password-email",
        mockAuthController.requestResetPasswordEmail,
      );
    });

    it("should return the configured router", () => {
      const result = AuthRoutes.routes;
      expect(result).toBe(mockRouter);
    });

    it("should define requestResetPasswordEmail endpoint", () => {
      AuthRoutes.routes;

      const postCalls = (mockRouter.post as jest.Mock).mock.calls;
      const resetPasswordRoute = postCalls.find(
        (call) => call[0] === "/request-reset-password-email",
      );

      expect(resetPasswordRoute).toBeDefined();
      expect(resetPasswordRoute[1]).toBe(
        mockAuthController.requestResetPasswordEmail,
      );
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
      expect(mockRouter.post).toHaveBeenCalledWith(
        "/login",
        expect.any(Function),
      );
      expect(mockRouter.post).toHaveBeenCalledWith(
        "/logout",
        authMiddleware,
        expect.any(Function),
      );
      expect(mockRouter.put).toHaveBeenCalledWith(
        "/update-user",
        authMiddleware,
        expect.any(Function),
      );
      expect(mockRouter.put).toHaveBeenCalledWith(
        "/update-user-password",
        authMiddleware,
        expect.any(Function),
      );
      expect(mockRouter.post).toHaveBeenCalledWith(
        "/request-reset-password-email",
        expect.any(Function),
      );
    });

    it("should use controller methods as route handlers", () => {
      AuthRoutes.routes;

      // Verify that controller methods are used as handlers
      const postCalls = (mockRouter.post as jest.Mock).mock.calls;
      const putCalls = (mockRouter.put as jest.Mock).mock.calls;

      expect(postCalls[0][1]).toBe(mockAuthController.register);
      expect(postCalls[1][1]).toBe(mockAuthController.login);
      expect(postCalls[2][2]).toBe(mockAuthController.logout); // Third parameter due to middleware
      expect(postCalls[3][1]).toBe(mockAuthController.requestResetPasswordEmail);
      expect(putCalls[0][2]).toBe(mockAuthController.updateUser); // Third parameter due to middleware
      expect(putCalls[1][2]).toBe(mockAuthController.updateUserPassword); // Third parameter due to middleware
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
    it("should define POST and PUT routes", () => {
      AuthRoutes.routes;

      // Verify POST and PUT methods are used
      expect(mockRouter.post).toHaveBeenCalledTimes(4); // Updated to 4 for register, login, logout, and request-reset-password-email
      expect(mockRouter.put).toHaveBeenCalledTimes(2); // Updated to 2 for both PUT routes
      expect(mockRouter.get).not.toHaveBeenCalled();
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

    it("should define login endpoint", () => {
      AuthRoutes.routes;

      const postCalls = (mockRouter.post as jest.Mock).mock.calls;
      const loginRoute = postCalls.find((call) => call[0] === "/login");

      expect(loginRoute).toBeDefined();
      expect(loginRoute[1]).toBe(mockAuthController.login);
    });

    it("should define logout endpoint", () => {
      AuthRoutes.routes;

      const postCalls = (mockRouter.post as jest.Mock).mock.calls;
      const logoutRoute = postCalls.find((call) => call[0] === "/logout");

      expect(logoutRoute).toBeDefined();
      expect(logoutRoute[1]).toBe(authMiddleware);
      expect(logoutRoute[2]).toBe(mockAuthController.logout);
    });

    it("should define updateUser endpoint", () => {
      AuthRoutes.routes;

      const putCalls = (mockRouter.put as jest.Mock).mock.calls;
      const updateRoute = putCalls.find((call) => call[0] === "/update-user");

      expect(updateRoute).toBeDefined();
      expect(updateRoute[1]).toBe(authMiddleware);
      expect(updateRoute[2]).toBe(mockAuthController.updateUser);
    });

    it("should define updateUserPassword endpoint", () => {
      AuthRoutes.routes;

      const putCalls = (mockRouter.put as jest.Mock).mock.calls;
      const updatePasswordRoute = putCalls.find(
        (call) => call[0] === "/update-user-password",
      );

      expect(updatePasswordRoute).toBeDefined();
      expect(updatePasswordRoute[1]).toBe(authMiddleware);
      expect(updatePasswordRoute[2]).toBe(
        mockAuthController.updateUserPassword,
      );
    });
  });

  describe("Middleware Integration", () => {
    it("should apply authMiddleware to protected routes", () => {
      AuthRoutes.routes;

      const postCalls = (mockRouter.post as jest.Mock).mock.calls;
      const putCalls = (mockRouter.put as jest.Mock).mock.calls;

      // Check that authMiddleware is applied to logout route
      const logoutCall = postCalls.find((call) => call[0] === "/logout");
      expect(logoutCall[1]).toBe(authMiddleware);

      // Check that authMiddleware is applied to update-user route
      const updateUserCall = putCalls.find((call) => call[0] === "/update-user");
      expect(updateUserCall[1]).toBe(authMiddleware);

      // Check that authMiddleware is applied to update-user-password route
      const updatePasswordCall = putCalls.find(
        (call) => call[0] === "/update-user-password",
      );
      expect(updatePasswordCall[1]).toBe(authMiddleware);
    });

    it("should not apply authMiddleware to public routes", () => {
      AuthRoutes.routes;

      const postCalls = (mockRouter.post as jest.Mock).mock.calls;

      // Check that authMiddleware is NOT applied to register route
      const registerCall = postCalls.find((call) => call[0] === "/register");
      expect(registerCall[1]).toBe(mockAuthController.register);
      expect(registerCall[1]).not.toBe(authMiddleware);

      // Check that authMiddleware is NOT applied to login route
      const loginCall = postCalls.find((call) => call[0] === "/login");
      expect(loginCall[1]).toBe(mockAuthController.login);
      expect(loginCall[1]).not.toBe(authMiddleware);

      // Check that authMiddleware is NOT applied to request-reset-password-email route
      const resetPasswordCall = postCalls.find(
        (call) => call[0] === "/request-reset-password-email",
      );
      expect(resetPasswordCall[1]).toBe(
        mockAuthController.requestResetPasswordEmail,
      );
      expect(resetPasswordCall[1]).not.toBe(authMiddleware);
    });

    it("should have correct middleware order for protected routes", () => {
      AuthRoutes.routes;

      const postCalls = (mockRouter.post as jest.Mock).mock.calls;
      const putCalls = (mockRouter.put as jest.Mock).mock.calls;

      // Verify middleware comes before controller for logout
      const logoutCall = postCalls.find((call) => call[0] === "/logout");
      expect(logoutCall).toHaveLength(3); // path, middleware, controller
      expect(logoutCall[1]).toBe(authMiddleware);
      expect(logoutCall[2]).toBe(mockAuthController.logout);

      // Verify middleware comes before controller for update-user
      const updateUserCall = putCalls.find((call) => call[0] === "/update-user");
      expect(updateUserCall).toHaveLength(3); // path, middleware, controller
      expect(updateUserCall[1]).toBe(authMiddleware);
      expect(updateUserCall[2]).toBe(mockAuthController.updateUser);

      // Verify middleware comes before controller for update-user-password
      const updatePasswordCall = putCalls.find(
        (call) => call[0] === "/update-user-password",
      );
      expect(updatePasswordCall).toHaveLength(3); // path, middleware, controller
      expect(updatePasswordCall[1]).toBe(authMiddleware);
      expect(updatePasswordCall[2]).toBe(mockAuthController.updateUserPassword);
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
      (AuthDatasource as unknown as jest.Mock).mockImplementation(() => {
        throw new Error("Datasource creation failed");
      });

      expect(() => AuthRoutes.routes).toThrow("Datasource creation failed");
    });

    it("should handle AuthController creation errors gracefully", () => {
      (AuthController as unknown as jest.Mock).mockImplementation(() => {
        throw new Error("Controller creation failed");
      });

      expect(() => AuthRoutes.routes).toThrow("Controller creation failed");
    });
  });
});
