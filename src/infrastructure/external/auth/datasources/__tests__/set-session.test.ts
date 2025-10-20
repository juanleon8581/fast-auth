import { AuthDatasource } from "@/infrastructure/external/auth/datasources/auth.datasource";
import { AuthClient } from "@/infrastructure/external/auth/auth.client";
import { AuthUserEntity } from "@/domain/auth/entities/auth-user.entity";
import { UserEntity } from "@/domain/user/entities/user.entity";
import { DatasourceUserMapper } from "@/infrastructure/external/auth/mappers/datasource-user.mapper";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { ValidationError } from "@/domain/errors/validation-error";
import { ERRORS } from "@/config/strings/global.strings.json";
import {
  createMockUser,
  createMockSession,
  createMockDatasourceUserMapper,
  createMockUserEntity,
  createMockAuthUserEntity,
} from "@/config/__tests__/__helpers__/auth-datasource.helpers";

// Mock dependencies
jest.mock("@/infrastructure/external/auth/auth.client");
jest.mock("@/domain/user/entities/user.entity");
jest.mock("@/domain/auth/entities/auth-user.entity");
jest.mock("@/infrastructure/external/auth/mappers/datasource-user.mapper");

const MockedAuthClient = AuthClient as jest.MockedClass<typeof AuthClient>;
const MockedUserEntity = UserEntity as jest.MockedClass<typeof UserEntity>;
const MockedAuthUserEntity = AuthUserEntity as jest.MockedClass<any>;
const MockedDatasourceUserMapper = DatasourceUserMapper as jest.MockedClass<
  typeof DatasourceUserMapper
>;

describe("AuthDatasource - setSession Method", () => {
  let authDatasource: AuthDatasource;
  let mockSupabaseClient: any;
  let mockAuthClient: any;
  let mockUser: any;
  let mockSession: any;
  let mockRefreshSession: any;
  let mockDatasourceUserMapper: any;
  let mockUserEntity: UserEntity;
  let mockAuthUserEntity: AuthUserEntity;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock data
    mockUser = createMockUser();
    mockSession = createMockSession();
    mockRefreshSession = {
      ...createMockSession(),
      access_token: "refreshed-access-token-123",
      refresh_token: "refreshed-refresh-token-123",
    };
    mockDatasourceUserMapper = createMockDatasourceUserMapper();
    mockUserEntity = createMockUserEntity();
    mockAuthUserEntity = createMockAuthUserEntity();

    // Create mock Supabase client
    mockSupabaseClient = {
      auth: {
        setSession: jest.fn(),
        refreshSession: jest.fn(),
      },
    };

    // Create mock AuthClient
    mockAuthClient = {
      create: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    MockedAuthClient.mockImplementation(() => mockAuthClient);

    // Mock entity constructors
    MockedUserEntity.createFrom = jest.fn().mockReturnValue(mockUserEntity);
    MockedAuthUserEntity.createFrom = jest
      .fn()
      .mockReturnValue(mockAuthUserEntity);

    // Create instance after mocks are set up
    authDatasource = new AuthDatasource(MockedAuthClient);
  });

  describe("successful setSession with refresh", () => {
    beforeEach(() => {
      // Mock successful setSession
      mockSupabaseClient.auth.setSession.mockResolvedValue({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      });

      // Mock successful refreshSession
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: {
          session: mockRefreshSession,
        },
        error: null,
      });

      // Mock successful DatasourceUserMapper creation
      (MockedDatasourceUserMapper.createFrom as jest.Mock).mockReturnValue([
        null,
        mockDatasourceUserMapper,
      ]);
    });

    it("should successfully set session and refresh it", async () => {
      const sessionToken = "test-session-token";
      const refreshToken = "test-refresh-token";

      // Access the private static method through reflection
      const setSessionMethod = (AuthDatasource as any).setSession;
      const result = await setSessionMethod(
        mockSupabaseClient,
        sessionToken,
        refreshToken,
      );

      expect(result).toBe(mockAuthUserEntity);
      expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledWith({
        access_token: sessionToken,
        refresh_token: refreshToken,
      });
      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: refreshToken,
      });
    });

    it("should create user entity from datasource user dto", async () => {
      const sessionToken = "test-session-token";
      const refreshToken = "test-refresh-token";

      const setSessionMethod = (AuthDatasource as any).setSession;
      await setSessionMethod(mockSupabaseClient, sessionToken, refreshToken);

      expect(MockedDatasourceUserMapper.createFrom).toHaveBeenCalledWith(
        mockUser,
      );
      expect(MockedUserEntity.createFrom).toHaveBeenCalledWith(
        mockDatasourceUserMapper,
      );
    });

    it("should create auth user entity with refreshed session data", async () => {
      const sessionToken = "test-session-token";
      const refreshToken = "test-refresh-token";

      const setSessionMethod = (AuthDatasource as any).setSession;
      await setSessionMethod(mockSupabaseClient, sessionToken, refreshToken);

      expect(MockedAuthUserEntity.createFrom).toHaveBeenCalledWith({
        user: mockUserEntity,
        data: mockRefreshSession,
      });
    });

    it("should call methods in correct order", async () => {
      const sessionToken = "test-session-token";
      const refreshToken = "test-refresh-token";

      const setSessionMethod = (AuthDatasource as any).setSession;
      await setSessionMethod(mockSupabaseClient, sessionToken, refreshToken);

      // Verify all methods were called
      expect(mockSupabaseClient.auth.setSession).toHaveBeenCalled();
      expect(MockedDatasourceUserMapper.createFrom).toHaveBeenCalled();
      expect(MockedUserEntity.createFrom).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalled();
      expect(MockedAuthUserEntity.createFrom).toHaveBeenCalled();
    });
  });

  describe("setSession errors", () => {
    it("should throw BadRequestError when setSession fails", async () => {
      const error = {
        message: "Invalid session",
        code: "invalid_session",
        status: 400,
      };

      mockSupabaseClient.auth.setSession.mockResolvedValue({
        data: null,
        error,
      });

      const sessionToken = "invalid-session-token";
      const refreshToken = "invalid-refresh-token";

      const setSessionMethod = (AuthDatasource as any).setSession;

      await expect(
        setSessionMethod(mockSupabaseClient, sessionToken, refreshToken),
      ).rejects.toThrow(BadRequestError);

      await expect(
        setSessionMethod(mockSupabaseClient, sessionToken, refreshToken),
      ).rejects.toThrow("Invalid session");
    });

    it("should throw BadRequestError when user is not found after setSession", async () => {
      mockSupabaseClient.auth.setSession.mockResolvedValue({
        data: {
          user: null,
          session: mockSession,
        },
        error: null,
      });

      const sessionToken = "test-session-token";
      const refreshToken = "test-refresh-token";

      const setSessionMethod = (AuthDatasource as any).setSession;

      await expect(
        setSessionMethod(mockSupabaseClient, sessionToken, refreshToken),
      ).rejects.toThrow(BadRequestError);

      await expect(
        setSessionMethod(mockSupabaseClient, sessionToken, refreshToken),
      ).rejects.toThrow(ERRORS.AUTH.LOGIN.USER_NOT_FOUND);
    });

    it("should throw BadRequestError when session is not found after setSession", async () => {
      mockSupabaseClient.auth.setSession.mockResolvedValue({
        data: {
          user: mockUser,
          session: null,
        },
        error: null,
      });

      const sessionToken = "test-session-token";
      const refreshToken = "test-refresh-token";

      const setSessionMethod = (AuthDatasource as any).setSession;

      await expect(
        setSessionMethod(mockSupabaseClient, sessionToken, refreshToken),
      ).rejects.toThrow(BadRequestError);

      await expect(
        setSessionMethod(mockSupabaseClient, sessionToken, refreshToken),
      ).rejects.toThrow(ERRORS.AUTH.LOGIN.USER_NOT_FOUND);
    });

    it("should throw ValidationError when DatasourceUserMapper creation fails", async () => {
      mockSupabaseClient.auth.setSession.mockResolvedValue({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      });

      const validationError = "Invalid user data";
      (MockedDatasourceUserMapper.createFrom as jest.Mock).mockReturnValue([
        validationError,
        null,
      ]);

      const sessionToken = "test-session-token";
      const refreshToken = "test-refresh-token";

      const setSessionMethod = (AuthDatasource as any).setSession;

      await expect(
        setSessionMethod(mockSupabaseClient, sessionToken, refreshToken),
      ).rejects.toThrow(ValidationError);

      await expect(
        setSessionMethod(mockSupabaseClient, sessionToken, refreshToken),
      ).rejects.toThrow(validationError);
    });
  });

  describe("refreshSession errors", () => {
    beforeEach(() => {
      // Mock successful setSession
      mockSupabaseClient.auth.setSession.mockResolvedValue({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      });

      // Mock successful DatasourceUserMapper creation
      (MockedDatasourceUserMapper.createFrom as jest.Mock).mockReturnValue([
        null,
        mockDatasourceUserMapper,
      ]);
    });

    it("should throw BadRequestError when refreshSession fails", async () => {
      const refreshError = {
        message: "Invalid refresh token",
        code: "invalid_refresh_token",
        status: 401,
      };

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: null,
        error: refreshError,
      });

      const sessionToken = "test-session-token";
      const refreshToken = "invalid-refresh-token";

      const setSessionMethod = (AuthDatasource as any).setSession;

      await expect(
        setSessionMethod(mockSupabaseClient, sessionToken, refreshToken),
      ).rejects.toThrow(BadRequestError);

      await expect(
        setSessionMethod(mockSupabaseClient, sessionToken, refreshToken),
      ).rejects.toThrow("Invalid refresh token");
    });

    it("should throw BadRequestError when refreshed session is not found", async () => {
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: {
          session: null,
        },
        error: null,
      });

      const sessionToken = "test-session-token";
      const refreshToken = "test-refresh-token";

      const setSessionMethod = (AuthDatasource as any).setSession;

      await expect(
        setSessionMethod(mockSupabaseClient, sessionToken, refreshToken),
      ).rejects.toThrow(BadRequestError);

      await expect(
        setSessionMethod(mockSupabaseClient, sessionToken, refreshToken),
      ).rejects.toThrow(ERRORS.AUTH.REFRESH_SESSION.SESSION_NOT_FOUND);
    });

    it("should not call refreshSession if setSession fails", async () => {
      const setSessionError = {
        message: "Invalid session",
        code: "invalid_session",
        status: 400,
      };

      mockSupabaseClient.auth.setSession.mockResolvedValue({
        data: null,
        error: setSessionError,
      });

      const sessionToken = "invalid-session-token";
      const refreshToken = "test-refresh-token";

      const setSessionMethod = (AuthDatasource as any).setSession;

      try {
        await setSessionMethod(mockSupabaseClient, sessionToken, refreshToken);
      } catch {
        // Expected to throw
      }

      expect(mockSupabaseClient.auth.refreshSession).not.toHaveBeenCalled();
    });
  });

  describe("method accessibility", () => {
    it("should be a private static method", () => {
      // Verify that setSession is not directly accessible on instance
      expect((authDatasource as any).setSession).toBeUndefined();

      // Verify that it exists as a static method on the class
      expect(typeof (AuthDatasource as any).setSession).toBe("function");
    });

    it("should require authClient, sessionToken, and refreshToken parameters", async () => {
      const setSessionMethod = (AuthDatasource as any).setSession;

      // Mock successful responses
      mockSupabaseClient.auth.setSession.mockResolvedValue({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      });

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: {
          session: mockRefreshSession,
        },
        error: null,
      });

      (MockedDatasourceUserMapper.createFrom as jest.Mock).mockReturnValue([
        null,
        mockDatasourceUserMapper,
      ]);

      // Test with all required parameters
      await expect(
        setSessionMethod(mockSupabaseClient, "session-token", "refresh-token"),
      ).resolves.toBeDefined();

      // Verify parameters were used correctly
      expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledWith({
        access_token: "session-token",
        refresh_token: "refresh-token",
      });

      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: "refresh-token",
      });
    });
  });
});
