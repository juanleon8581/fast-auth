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
  AuthMiddleware: {
    verify: jest.fn((req: any, res: any, next: any) => next()),
  },
}));
jest.mock("@/presentation/middlewares/crypto.middleware", () => ({
  CryptoMiddleware: {
    decrypt: jest.fn((req: any, res: any, next: any) => next()),
  },
}));

// Import the mocked AuthMiddleware
const {
  AuthMiddleware,
} = require("@/presentation/middlewares/auth.middleware");

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
      getPublicKey: jest.fn(),
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
        expect.any(Function),
        mockAuthController.register,
      );
    });

    it("should register POST /login route", () => {
      AuthRoutes.routes;
      expect(mockRouter.post).toHaveBeenCalledWith(
        "/login",
        expect.any(Function),
        mockAuthController.login,
      );
    });

    it("should register POST /logout route with AuthMiddleware.verify", () => {
      AuthRoutes.routes;
      expect(mockRouter.post).toHaveBeenCalledWith(
        "/logout",
        expect.any(Function),
        AuthMiddleware.verify,
        mockAuthController.logout,
      );
    });

    it("should register PUT /update route with AuthMiddleware.verify", () => {
      AuthRoutes.routes;
      expect(mockRouter.put).toHaveBeenCalledWith(
        "/update-user",
        expect.any(Function),
        AuthMiddleware.verify,
        mockAuthController.updateUser,
      );
    });

    it("should register PUT /update-user-password route with AuthMiddleware.verify", () => {
      AuthRoutes.routes;
      expect(mockRouter.put).toHaveBeenCalledWith(
        "/update-user-password",
        expect.any(Function),
        AuthMiddleware.verify,
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
        expect.any(Function),
      );
      expect(mockRouter.post).toHaveBeenCalledWith(
        "/login",
        expect.any(Function),
        expect.any(Function),
      );
      expect(mockRouter.post).toHaveBeenCalledWith(
        "/logout",
        expect.any(Function),
        AuthMiddleware.verify,
        expect.any(Function),
      );
      expect(mockRouter.put).toHaveBeenCalledWith(
        "/update-user",
        expect.any(Function),
        AuthMiddleware.verify,
        expect.any(Function),
      );
      expect(mockRouter.put).toHaveBeenCalledWith(
        "/update-user-password",
        expect.any(Function),
        AuthMiddleware.verify,
        expect.any(Function),
      );
      expect(mockRouter.post).toHaveBeenCalledWith(
        "/request-reset-password-email",
        expect.any(Function),
      );
      expect(mockRouter.get).toHaveBeenCalledWith(
        "/public-key",
        expect.any(Function),
      );
    });

    it("should use controller methods as route handlers", () => {
      AuthRoutes.routes;

      // Verify that controller methods are used as handlers
      const postCalls = (mockRouter.post as jest.Mock).mock.calls;
      const putCalls = (mockRouter.put as jest.Mock).mock.calls;

      const registerCall = postCalls.find((c) => c[0] === "/register");
      const loginCall = postCalls.find((c) => c[0] === "/login");
      const logoutCall = postCalls.find((c) => c[0] === "/logout");
      const resetCall = postCalls.find(
        (c) => c[0] === "/request-reset-password-email",
      );

      expect(registerCall?.[1]).toEqual(expect.any(Function));
      expect(registerCall?.[2]).toBe(mockAuthController.register);
      expect(loginCall?.[1]).toEqual(expect.any(Function));
      expect(loginCall?.[2]).toBe(mockAuthController.login);
      expect(logoutCall?.[3]).toBe(mockAuthController.logout);
      expect(resetCall?.[1]).toBe(mockAuthController.requestResetPasswordEmail);

      const updateCall = putCalls.find((c) => c[0] === "/update-user");
      const updatePwdCall = putCalls.find(
        (c) => c[0] === "/update-user-password",
      );
      expect(updateCall?.[3]).toBe(mockAuthController.updateUser);
      expect(updatePwdCall?.[3]).toBe(mockAuthController.updateUserPassword);
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
      expect(mockRouter.post).toHaveBeenCalledTimes(4); // register, login, logout, request-reset-password-email
      expect(mockRouter.put).toHaveBeenCalledTimes(2); // both PUT routes
      expect(mockRouter.get).toHaveBeenCalledTimes(1); // public-key
      expect(mockRouter.delete).not.toHaveBeenCalled();
      expect(mockRouter.patch).not.toHaveBeenCalled();
    });

    it("should define register endpoint", () => {
      AuthRoutes.routes;

      const postCalls = (mockRouter.post as jest.Mock).mock.calls;
      const registerRoute = postCalls.find((call) => call[0] === "/register");

      expect(registerRoute).toBeDefined();
      expect(registerRoute[1]).toEqual(expect.any(Function));
      expect(registerRoute[2]).toBe(mockAuthController.register);
    });

    it("should define login endpoint", () => {
      AuthRoutes.routes;

      const postCalls = (mockRouter.post as jest.Mock).mock.calls;
      const loginRoute = postCalls.find((call) => call[0] === "/login");

      expect(loginRoute).toBeDefined();
      expect(loginRoute[1]).toEqual(expect.any(Function));
      expect(loginRoute[2]).toBe(mockAuthController.login);
    });

    it("should define logout endpoint", () => {
      AuthRoutes.routes;

      const postCalls = (mockRouter.post as jest.Mock).mock.calls;
      const logoutRoute = postCalls.find((call) => call[0] === "/logout");

      expect(logoutRoute).toBeDefined();
      expect(logoutRoute[1]).toEqual(expect.any(Function));
      expect(logoutRoute[2]).toBe(AuthMiddleware.verify);
      expect(logoutRoute[3]).toBe(mockAuthController.logout);
    });

    it("should define updateUser endpoint", () => {
      AuthRoutes.routes;

      const putCalls = (mockRouter.put as jest.Mock).mock.calls;
      const updateRoute = putCalls.find((call) => call[0] === "/update-user");

      expect(updateRoute).toBeDefined();
      expect(updateRoute[1]).toEqual(expect.any(Function));
      expect(updateRoute[2]).toBe(AuthMiddleware.verify);
      expect(updateRoute[3]).toBe(mockAuthController.updateUser);
    });

    it("should define updateUserPassword endpoint", () => {
      AuthRoutes.routes;

      const putCalls = (mockRouter.put as jest.Mock).mock.calls;
      const updatePasswordRoute = putCalls.find(
        (call) => call[0] === "/update-user-password",
      );

      expect(updatePasswordRoute).toBeDefined();
      expect(updatePasswordRoute[1]).toEqual(expect.any(Function));
      expect(updatePasswordRoute[2]).toBe(AuthMiddleware.verify);
      expect(updatePasswordRoute[3]).toBe(
        mockAuthController.updateUserPassword,
      );
    });
  });

  describe("Middleware Integration", () => {
    it("should apply AuthMiddleware.verify to protected routes", () => {
      AuthRoutes.routes;

      const postCalls = (mockRouter.post as jest.Mock).mock.calls;
      const putCalls = (mockRouter.put as jest.Mock).mock.calls;

      // Check that authMiddleware is applied to logout route
      const logoutCall = postCalls.find((call) => call[0] === "/logout");
      expect(logoutCall[2]).toBe(AuthMiddleware.verify);

      // Check that authMiddleware is applied to update-user route
      const updateUserCall = putCalls.find(
        (call) => call[0] === "/update-user",
      );
      expect(updateUserCall[2]).toBe(AuthMiddleware.verify);

      // Check that authMiddleware is applied to update-user-password route
      const updatePasswordCall = putCalls.find(
        (call) => call[0] === "/update-user-password",
      );
      expect(updatePasswordCall[2]).toBe(AuthMiddleware.verify);
    });

    it("should not apply AuthMiddleware.verify to public routes", () => {
      AuthRoutes.routes;

      const postCalls = (mockRouter.post as jest.Mock).mock.calls;

      // Check that authMiddleware is NOT applied to register route
      const registerCall = postCalls.find((call) => call[0] === "/register");
      expect(registerCall[1]).toEqual(expect.any(Function));
      expect(registerCall[1]).not.toBe(AuthMiddleware.verify);
      expect(registerCall[2]).toBe(mockAuthController.register);

      // Check that authMiddleware is NOT applied to login route
      const loginCall = postCalls.find((call) => call[0] === "/login");
      expect(loginCall[1]).toEqual(expect.any(Function));
      expect(loginCall[1]).not.toBe(AuthMiddleware.verify);
      expect(loginCall[2]).toBe(mockAuthController.login);

      // Check that authMiddleware is NOT applied to request-reset-password-email route
      const resetPasswordCall = postCalls.find(
        (call) => call[0] === "/request-reset-password-email",
      );
      expect(resetPasswordCall[1]).toBe(
        mockAuthController.requestResetPasswordEmail,
      );
      expect(resetPasswordCall[1]).not.toBe(AuthMiddleware.verify);
    });

    it("should have correct middleware order for protected routes", () => {
      AuthRoutes.routes;

      const postCalls = (mockRouter.post as jest.Mock).mock.calls;
      const putCalls = (mockRouter.put as jest.Mock).mock.calls;

      // Verify middleware comes before controller for logout
      const logoutCall = postCalls.find((call) => call[0] === "/logout");
      expect(logoutCall).toHaveLength(4); // path, crypto middleware, auth middleware, controller
      expect(logoutCall[1]).toEqual(expect.any(Function));
      expect(logoutCall[2]).toBe(AuthMiddleware.verify);
      expect(logoutCall[3]).toBe(mockAuthController.logout);

      // Verify middleware comes before controller for update-user
      const updateUserCall = putCalls.find(
        (call) => call[0] === "/update-user",
      );
      expect(updateUserCall).toHaveLength(4); // path, crypto middleware, auth middleware, controller
      expect(updateUserCall[1]).toEqual(expect.any(Function));
      expect(updateUserCall[2]).toBe(AuthMiddleware.verify);
      expect(updateUserCall[3]).toBe(mockAuthController.updateUser);

      // Verify middleware comes before controller for update-user-password
      const updatePasswordCall = putCalls.find(
        (call) => call[0] === "/update-user-password",
      );
      expect(updatePasswordCall).toHaveLength(4); // path, crypto middleware, auth middleware, controller
      expect(updatePasswordCall[1]).toEqual(expect.any(Function));
      expect(updatePasswordCall[2]).toBe(AuthMiddleware.verify);
      expect(updatePasswordCall[3]).toBe(mockAuthController.updateUserPassword);
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
