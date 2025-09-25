import { AuthDatasource } from "../auth.datasource";
import { AuthClient } from "@/infrastructure/config/auth.client";
import { UpdateUserDto } from "@/domain/dtos/update-user.dto";
import { UserEntity } from "@/domain/entities/user.entity";
import { DatasourceUserDto } from "@/infrastructure/dtos/datasource-user.dto";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { ValidationError } from "@/domain/errors/validation-error";
import { ERRORS } from "@/config/strings/global.strings.json";
import {
  createMockUpdateUserDto,
  createMockUser,
  createMockDatasourceUserDto,
  createMockUserEntity,
} from "@/config/__tests__/__helpers__/auth-datasource.helpers";

// Mock dependencies
jest.mock("@/infrastructure/config/auth.client");
jest.mock("@/domain/entities/user.entity");
jest.mock("@/infrastructure/dtos/datasource-user.dto");

const MockedAuthClient = AuthClient as jest.MockedClass<typeof AuthClient>;
const MockedUserEntity = UserEntity as jest.MockedClass<typeof UserEntity>;
const MockedDatasourceUserDto = DatasourceUserDto as jest.MockedClass<
  typeof DatasourceUserDto
>;

describe("AuthDatasource - UpdateUser Functionality", () => {
  let authDatasource: AuthDatasource;
  let mockSupabaseClient: any;
  let mockAuthClient: any;
  let mockUpdateUserDto: UpdateUserDto;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabaseClient = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        setSession: jest.fn(),
        signOut: jest.fn(),
        updateUser: jest.fn(),
      },
    };

    // Create mock AuthClient
    mockAuthClient = {
      create: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    MockedAuthClient.mockImplementation(() => mockAuthClient);

    // Create test data
    mockUpdateUserDto = createMockUpdateUserDto();

    // Create instance after mocks are set up
    authDatasource = new AuthDatasource(MockedAuthClient);
  });

  describe("updateUser method", () => {
    describe("successful update scenarios", () => {
      beforeEach(() => {
        const mockUser = createMockUser();
        const mockDatasourceUserDto = createMockDatasourceUserDto();
        const mockUserEntity = createMockUserEntity();

        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: null,
        });

        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([
          undefined,
          mockDatasourceUserDto,
        ]);

        (MockedUserEntity.createFrom as jest.Mock).mockReturnValue(
          mockUserEntity,
        );
      });

      it("should successfully update user with all fields", async () => {
        const result = await authDatasource.updateUser(mockUpdateUserDto);

        expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledWith({
          access_token: mockUpdateUserDto.sessionToken,
          refresh_token: mockUpdateUserDto.refreshToken,
        });

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          email: mockUpdateUserDto.email,
          password: mockUpdateUserDto.newPassword,
          phone: mockUpdateUserDto.phone,
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
      });

      it("should successfully update user with only email", async () => {
        const updateDto = {
          ...mockUpdateUserDto,
          newPassword: undefined,
          phone: undefined,
        } as UpdateUserDto;

        await authDatasource.updateUser(updateDto);

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          email: updateDto.email,
          password: undefined,
          phone: undefined,
        });
      });

      it("should successfully update user with only password", async () => {
        const updateDto = {
          ...mockUpdateUserDto,
          email: undefined,
          phone: undefined,
        } as UpdateUserDto;

        await authDatasource.updateUser(updateDto);

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          email: undefined,
          password: updateDto.newPassword,
          phone: undefined,
        });
      });

      it("should successfully update user with only phone", async () => {
        const updateDto = {
          ...mockUpdateUserDto,
          email: undefined,
          newPassword: undefined,
        } as UpdateUserDto;

        await authDatasource.updateUser(updateDto);

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          email: undefined,
          password: undefined,
          phone: updateDto.phone,
        });
      });

      it("should create UserEntity with correct parameters", async () => {
        await authDatasource.updateUser(mockUpdateUserDto);

        expect(MockedUserEntity.createFrom).toHaveBeenCalled();
      });

      it("should return UserEntity", async () => {
        const result = await authDatasource.updateUser(mockUpdateUserDto);

        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
      });
    });

    describe("authentication and session handling", () => {
      it("should set session before updating user", async () => {
        const mockUser = createMockUser();
        const mockDatasourceUserDto = createMockDatasourceUserDto();
        const mockUserEntity = createMockUserEntity();

        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: null,
        });

        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([
          undefined,
          mockDatasourceUserDto,
        ]);

        (MockedUserEntity.createFrom as jest.Mock).mockReturnValue(
          mockUserEntity,
        );

        await authDatasource.updateUser(mockUpdateUserDto);

        expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledWith({
          access_token: mockUpdateUserDto.sessionToken,
          refresh_token: mockUpdateUserDto.refreshToken,
        });
        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalled();
      });

      it("should throw error when sessionToken is missing", async () => {
        const invalidDto = {
          ...mockUpdateUserDto,
          sessionToken: "",
        } as UpdateUserDto;

        await expect(authDatasource.updateUser(invalidDto)).rejects.toThrow(
          BadRequestError,
        );
        await expect(authDatasource.updateUser(invalidDto)).rejects.toThrow(
          ERRORS.AUTH.LOGOUT.USER_NOT_LOGGED_OUT,
        );
      });

      it("should throw error when refreshToken is missing", async () => {
        const invalidDto = {
          ...mockUpdateUserDto,
          refreshToken: "",
        } as UpdateUserDto;

        await expect(authDatasource.updateUser(invalidDto)).rejects.toThrow(
          BadRequestError,
        );
        await expect(authDatasource.updateUser(invalidDto)).rejects.toThrow(
          ERRORS.AUTH.LOGOUT.USER_NOT_LOGGED_OUT,
        );
      });

      it("should throw error when both tokens are missing", async () => {
        const invalidDto = {
          ...mockUpdateUserDto,
          sessionToken: "",
          refreshToken: "",
        } as UpdateUserDto;

        await expect(authDatasource.updateUser(invalidDto)).rejects.toThrow(
          BadRequestError,
        );
      });
    });

    describe("error handling", () => {
      it("should throw error when setSession fails", async () => {
        const sessionError = {
          message: "Invalid session",
          code: "invalid_session",
          status: 401,
        };

        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: sessionError,
        });

        await expect(authDatasource.updateUser(mockUpdateUserDto)).rejects.toThrow(
          BadRequestError,
        );
        await expect(authDatasource.updateUser(mockUpdateUserDto)).rejects.toThrow(
          "Invalid session",
        );
      });

      it("should throw error when updateUser fails", async () => {
        const updateError = {
          message: "Update failed",
          code: "update_failed",
          status: 400,
        };

        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: null,
        });

        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: null },
          error: updateError,
        });

        await expect(authDatasource.updateUser(mockUpdateUserDto)).rejects.toThrow(
          BadRequestError,
        );
        await expect(authDatasource.updateUser(mockUpdateUserDto)).rejects.toThrow(
          "Update failed",
        );
      });

      it("should throw error when user is null after update", async () => {
        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: null,
        });

        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: null },
          error: null,
        });

        await expect(authDatasource.updateUser(mockUpdateUserDto)).rejects.toThrow(
          BadRequestError,
        );
        await expect(authDatasource.updateUser(mockUpdateUserDto)).rejects.toThrow(
          ERRORS.AUTH.UPDATE_USER.USER_NOT_UPDATED,
        );
      });

      it("should handle Supabase client creation failure", async () => {
        mockAuthClient.create.mockImplementation(() => {
          throw new Error("Failed to create Supabase client");
        });

        await expect(authDatasource.updateUser(mockUpdateUserDto)).rejects.toThrow(
          "Failed to create Supabase client",
        );
      });

      it("should handle DatasourceUserDto creation failure", async () => {
        const mockUser = createMockUser();

        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: null,
        });

        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([
          "Invalid user data",
          undefined,
        ]);

        await expect(authDatasource.updateUser(mockUpdateUserDto)).rejects.toThrow(
          ValidationError,
        );
        await expect(authDatasource.updateUser(mockUpdateUserDto)).rejects.toThrow(
          "Invalid user data",
        );
      });

      it("should handle DatasourceUserDto creation exception", async () => {
        const mockUser = createMockUser();

        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: null,
        });

        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        (MockedDatasourceUserDto.createFrom as jest.Mock).mockImplementation(
          () => {
            throw new Error("DTO creation failed");
          },
        );

        await expect(authDatasource.updateUser(mockUpdateUserDto)).rejects.toThrow(
          "DTO creation failed",
        );
      });
    });

    describe("method signature and return type", () => {
      it("should accept UpdateUserDto parameter", () => {
        expect(typeof authDatasource.updateUser).toBe("function");
        expect(authDatasource.updateUser.length).toBe(1);
      });

      it("should return Promise<UserEntity>", async () => {
        const mockUser = createMockUser();
        const mockDatasourceUserDto = createMockDatasourceUserDto();
        const mockUserEntity = createMockUserEntity();

        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: null,
        });

        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([
          undefined,
          mockDatasourceUserDto,
        ]);

        (MockedUserEntity.createFrom as jest.Mock).mockReturnValue(
          mockUserEntity,
        );

        const result = await authDatasource.updateUser(mockUpdateUserDto);

        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
        expect(result).toBe(mockUserEntity);
      });
    });

    describe("edge cases", () => {
      it("should handle empty update data", async () => {
        const emptyUpdateDto = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-123",
        } as UpdateUserDto;

        const mockUser = createMockUser();
        const mockDatasourceUserDto = createMockDatasourceUserDto();
        const mockUserEntity = createMockUserEntity();

        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: null,
        });

        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([
          undefined,
          mockDatasourceUserDto,
        ]);

        (MockedUserEntity.createFrom as jest.Mock).mockReturnValue(
          mockUserEntity,
        );

        await authDatasource.updateUser(emptyUpdateDto);

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          email: undefined,
          password: undefined,
          phone: undefined,
        });
      });

      it("should handle null values in update data", async () => {
        const nullUpdateDto = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-123",
          email: null,
          newPassword: null,
          phone: null,
        } as any;

        const mockUser = createMockUser();
        const mockDatasourceUserDto = createMockDatasourceUserDto();
        const mockUserEntity = createMockUserEntity();

        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: null,
        });

        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([
          undefined,
          mockDatasourceUserDto,
        ]);

        (MockedUserEntity.createFrom as jest.Mock).mockReturnValue(
          mockUserEntity,
        );

        await authDatasource.updateUser(nullUpdateDto);

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          email: null,
          password: null,
          phone: null,
        });
      });
    });
  });

  describe("integration with dependencies", () => {
    it("should properly integrate with all dependencies", async () => {
      const mockUser = {
        id: "user-123",
        email: "john.doe@example.com",
        user_metadata: { display_name: "John Doe" },
        email_confirmed_at: "2024-01-01T00:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
      };

      const mockDatasourceUserDto = {
        id: "user-123",
        email: "john.doe@example.com",
        name: "John Doe",
        email_verified: true,
        created_at: new Date(),
      };

      mockSupabaseClient.auth.setSession.mockResolvedValue({
        error: null,
      });

      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([
        undefined,
        mockDatasourceUserDto,
      ]);

      MockedUserEntity.mockImplementation(() => ({}) as UserEntity);

      await authDatasource.updateUser(mockUpdateUserDto);

      // Verify the flow: AuthClient -> setSession -> updateUser -> DatasourceUserDto -> UserEntity
      expect(mockAuthClient.create).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.setSession).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalled();
      expect(MockedDatasourceUserDto.createFrom).toHaveBeenCalled();
      expect(MockedUserEntity.createFrom).toHaveBeenCalled();
    });

    it("should maintain proper error propagation through the dependency chain", async () => {
      // Test error propagation from setSession
      mockSupabaseClient.auth.setSession.mockResolvedValue({
        error: { message: "Session error", code: "session_error", status: 401 },
      });

      await expect(authDatasource.updateUser(mockUpdateUserDto)).rejects.toThrow(
        BadRequestError,
      );

      // Reset and test error propagation from updateUser
      mockSupabaseClient.auth.setSession.mockResolvedValue({ error: null });
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Update error", code: "update_error", status: 400 },
      });

      await expect(authDatasource.updateUser(mockUpdateUserDto)).rejects.toThrow(
        BadRequestError,
      );
    });
  });
});