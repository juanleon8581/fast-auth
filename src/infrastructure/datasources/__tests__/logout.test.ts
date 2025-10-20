import { AuthDatasource } from "../auth.datasource";
import { AuthClient } from "@/infrastructure/config/auth.client";
import { LogoutDto } from "@/domain/auth/dtos/logout.dto";
import { createMockLogoutDto } from "@/config/__tests__/__helpers__/auth-datasource.helpers";

// Mock dependencies
jest.mock("@/infrastructure/config/auth.client");

const MockedAuthClient = AuthClient as jest.MockedClass<typeof AuthClient>;

describe("AuthDatasource - Logout Functionality", () => {
  let authDatasource: AuthDatasource;
  let mockSupabaseClient: any;
  let mockAuthClient: any;
  let mockLogoutDto: LogoutDto;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabaseClient = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        setSession: jest.fn(),
        refreshSession: jest.fn(),
        signOut: jest.fn(),
      },
    };

    // Create mock AuthClient
    mockAuthClient = {
      create: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    MockedAuthClient.mockImplementation(() => mockAuthClient);

    // Create test data
    mockLogoutDto = createMockLogoutDto();

    // Create instance after mocks are set up
    authDatasource = new AuthDatasource(MockedAuthClient);
  });

  describe("logout method", () => {
    describe("successful logout", () => {
      beforeEach(() => {
        mockSupabaseClient.auth.setSession.mockResolvedValue({
          data: {
            user: {
              id: "user-123",
              email: "test@example.com",
              email_confirmed_at: "2024-01-01T00:00:00Z",
              phone: "+1234567890",
              user_metadata: {
                display_name: "John Doe",
              },
            },
            session: { access_token: "token", refresh_token: "refresh" },
          },
          error: null,
        });

        mockSupabaseClient.auth.refreshSession.mockResolvedValue({
          data: {
            session: {
              access_token: "refreshed-token",
              refresh_token: "refreshed-refresh",
            },
          },
          error: null,
        });

        mockSupabaseClient.auth.signOut.mockResolvedValue({
          error: null,
        });
      });

      it("should call setSession and refreshSession during logout process", async () => {
        await authDatasource.logout(mockLogoutDto);

        expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledWith({
          access_token: mockLogoutDto.sessionToken,
          refresh_token: mockLogoutDto.refreshToken,
        });

        expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalledWith({
          refresh_token: mockLogoutDto.refreshToken,
        });
      });

      it("should call Supabase setSession with correct parameters", async () => {
        await authDatasource.logout(mockLogoutDto);

        expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledWith({
          access_token: mockLogoutDto.sessionToken,
          refresh_token: mockLogoutDto.refreshToken,
        });
      });

      it("should call Supabase signOut with global scope", async () => {
        await authDatasource.logout(mockLogoutDto);

        expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledWith({
          scope: "global",
        });
      });

      it("should create AuthClient and call create method", async () => {
        await authDatasource.logout(mockLogoutDto);

        expect(MockedAuthClient).toHaveBeenCalledTimes(1);
        expect(mockAuthClient.create).toHaveBeenCalledTimes(1);
      });

      it("should complete successfully without returning value", async () => {
        const result = await authDatasource.logout(mockLogoutDto);

        expect(result).toBeUndefined();
      });

      it("should call setSession, refreshSession and signOut in correct order", async () => {
        await authDatasource.logout(mockLogoutDto);

        // Verify all methods were called
        expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledTimes(1);
        expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalledTimes(1);
        expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
      });
    });

    describe("error handling", () => {
      it("should throw error when sessionToken is missing", async () => {
        const invalidLogoutDto = {
          sessionToken: "",
          refreshToken: "refresh-token-123",
        } as LogoutDto;

        await expect(authDatasource.logout(invalidLogoutDto)).rejects.toThrow(
          "User not logged out",
        );
      });

      it("should throw error when refreshToken is missing", async () => {
        const invalidLogoutDto = {
          sessionToken: "session-token-123",
          refreshToken: "",
        } as LogoutDto;

        await expect(authDatasource.logout(invalidLogoutDto)).rejects.toThrow(
          "User not logged out",
        );
      });

      it("should throw error when both tokens are missing", async () => {
        const invalidLogoutDto = {
          sessionToken: "",
          refreshToken: "",
        } as LogoutDto;

        await expect(authDatasource.logout(invalidLogoutDto)).rejects.toThrow(
          "User not logged out",
        );
      });

      it("should throw error when setSession fails", async () => {
        const setSessionError = {
          message: "Invalid session",
          code: "invalid_session",
          status: 400,
        };

        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: setSessionError,
        });

        await expect(authDatasource.logout(mockLogoutDto)).rejects.toThrow(
          "Invalid session",
        );
      });

      it("should throw error when signOut fails", async () => {
        mockSupabaseClient.auth.setSession.mockResolvedValue({
          data: {
            user: {
              id: "user-123",
              email: "test@example.com",
              email_confirmed_at: "2024-01-01T00:00:00Z",
              phone: "+1234567890",
              user_metadata: {
                display_name: "John Doe",
              },
            },
            session: { access_token: "token", refresh_token: "refresh" },
          },
          error: null,
        });

        mockSupabaseClient.auth.refreshSession.mockResolvedValue({
          data: {
            session: {
              access_token: "refreshed-token",
              refresh_token: "refreshed-refresh",
            },
          },
          error: null,
        });

        const signOutError = {
          message: "Failed to sign out",
          code: "signout_error",
          status: 500,
        };

        mockSupabaseClient.auth.signOut.mockResolvedValue({
          error: signOutError,
        });

        await expect(authDatasource.logout(mockLogoutDto)).rejects.toThrow(
          "Failed to sign out",
        );
      });

      it("should handle Supabase client creation failure", async () => {
        mockAuthClient.create.mockImplementation(() => {
          throw new Error("Failed to create Supabase client");
        });

        await expect(authDatasource.logout(mockLogoutDto)).rejects.toThrow(
          "Failed to create Supabase client",
        );
      });
    });

    describe("method signature and return type", () => {
      it("should accept LogoutDto parameter", () => {
        expect(typeof authDatasource.logout).toBe("function");
        expect(authDatasource.logout.length).toBe(1);
      });

      it("should return Promise<void>", async () => {
        mockSupabaseClient.auth.setSession.mockResolvedValue({
          data: {
            user: {
              id: "user-123",
              email: "test@example.com",
              email_confirmed_at: "2024-01-01T00:00:00Z",
              phone: "+1234567890",
              user_metadata: {
                display_name: "John Doe",
              },
            },
            session: { access_token: "token", refresh_token: "refresh" },
          },
          error: null,
        });

        mockSupabaseClient.auth.refreshSession.mockResolvedValue({
          data: {
            session: {
              access_token: "refreshed-token",
              refresh_token: "refreshed-refresh",
            },
          },
          error: null,
        });

        mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

        const result = await authDatasource.logout(mockLogoutDto);

        expect(result).toBeUndefined();
      });
    });
  });

  describe("integration with dependencies", () => {
    it("should properly integrate with all dependencies", async () => {
      mockSupabaseClient.auth.setSession.mockResolvedValue({
        data: {
          user: {
            id: "user-123",
            email: "test@example.com",
            email_confirmed_at: "2024-01-01T00:00:00Z",
            phone: "+1234567890",
            user_metadata: {
              display_name: "John Doe",
            },
          },
          session: { access_token: "token", refresh_token: "refresh" },
        },
        error: null,
      });

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: {
          session: {
            access_token: "refreshed-token",
            refresh_token: "refreshed-refresh",
          },
        },
        error: null,
      });

      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

      await authDatasource.logout(mockLogoutDto);

      // Verify the flow: AuthClient -> Supabase setSession -> refreshSession -> Supabase signOut
      expect(mockAuthClient.create).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.setSession).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });

    it("should validate tokens before attempting logout", async () => {
      const invalidDto = { sessionToken: null, refreshToken: null } as any;

      await expect(authDatasource.logout(invalidDto)).rejects.toThrow(
        "User not logged out",
      );

      // Should not call Supabase methods if validation fails
      expect(mockSupabaseClient.auth.setSession).not.toHaveBeenCalled();
      expect(mockSupabaseClient.auth.signOut).not.toHaveBeenCalled();
    });
  });
});
