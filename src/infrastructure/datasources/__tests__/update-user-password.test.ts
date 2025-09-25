import { AuthDatasource } from "../auth.datasource";
import { AuthClient } from "@/infrastructure/config/auth.client";
import { UpdateUserDto } from "@/domain/dtos/update-user.dto";
import { AuthUserEntity } from "@/domain/entities/auth-user.entity";
import { UserEntity } from "@/domain/entities/user.entity";
import { DatasourceUserDto } from "@/infrastructure/dtos/datasource-user.dto";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { ValidationError } from "@/domain/errors/validation-error";
import { ERRORS } from "@/config/strings/global.strings.json";
import {
  createMockUser,
  createMockDatasourceUserDto,
  createMockUserEntity,
  createMockAuthUserEntity,
} from "@/config/__tests__/__helpers__/auth-datasource.helpers";

// Mock dependencies
jest.mock("@/infrastructure/config/auth.client");
jest.mock("@/domain/entities/user.entity");
jest.mock("@/domain/entities/auth-user.entity");
jest.mock("@/infrastructure/dtos/datasource-user.dto");

const MockedAuthClient = AuthClient as jest.MockedClass<typeof AuthClient>;
const MockedUserEntity = UserEntity as jest.MockedClass<typeof UserEntity>;
const MockedAuthUserEntity = AuthUserEntity as jest.MockedClass<any>;
const MockedDatasourceUserDto = DatasourceUserDto as jest.MockedClass<
  typeof DatasourceUserDto
>;

describe("AuthDatasource - UpdateUserPassword Functionality", () => {
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

    // Create test data with password
    mockUpdateUserDto = {
      sessionToken: "session-token-123",
      refreshToken: "refresh-token-123",
      newPassword: "NewSecurePass123!",
    } as UpdateUserDto;

    // Create instance after mocks are set up
    authDatasource = new AuthDatasource(MockedAuthClient);
  });

  describe("updateUserPassword method", () => {
    describe("successful password update scenarios", () => {
      beforeEach(() => {
        const mockUser = createMockUser();
        const mockDatasourceUserDto = createMockDatasourceUserDto();
        const mockUserEntity = createMockUserEntity();
        const mockAuthUserEntity = createMockAuthUserEntity();

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

        (MockedAuthUserEntity.createFrom as jest.Mock).mockReturnValue(
          mockAuthUserEntity,
        );
      });

      it("should successfully update user password", async () => {
        const result = await authDatasource.updateUserPassword(mockUpdateUserDto);

        expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledWith({
          access_token: mockUpdateUserDto.sessionToken,
          refresh_token: mockUpdateUserDto.refreshToken,
        });

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          password: mockUpdateUserDto.newPassword,
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
      });

      it("should create AuthUserEntity with correct parameters", async () => {
        await authDatasource.updateUserPassword(mockUpdateUserDto);

        expect(MockedAuthUserEntity.createFrom).toHaveBeenCalledWith({
          user: expect.any(Object),
          data: {
            access_token: mockUpdateUserDto.sessionToken,
            refresh_token: mockUpdateUserDto.refreshToken,
          },
        });
      });

      it("should return AuthUserEntity", async () => {
        const result = await authDatasource.updateUserPassword(mockUpdateUserDto);

        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
      });
    });

    describe("authentication and session handling", () => {
      it("should set session before updating password", async () => {
        const mockUser = createMockUser();
        const mockDatasourceUserDto = createMockDatasourceUserDto();
        const mockUserEntity = createMockUserEntity();
        const mockAuthUserEntity = createMockAuthUserEntity();

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

        (MockedAuthUserEntity.createFrom as jest.Mock).mockReturnValue(
          mockAuthUserEntity,
        );

        await authDatasource.updateUserPassword(mockUpdateUserDto);

        expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledWith({
          access_token: mockUpdateUserDto.sessionToken,
          refresh_token: mockUpdateUserDto.refreshToken,
        });
        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalled();
      });

      it("should throw error when sessionToken is missing", async () => {
        const updateDto = {
          refreshToken: "refresh-token-123",
          newPassword: "NewSecurePass123!",
        } as unknown as UpdateUserDto;

        await expect(
          authDatasource.updateUserPassword(updateDto),
        ).rejects.toThrow(BadRequestError);
        await expect(
          authDatasource.updateUserPassword(updateDto),
        ).rejects.toThrow(ERRORS.AUTH.UPDATE_USER.USER_NOT_UPDATED);
      });

      it("should throw error when refreshToken is missing", async () => {
        const updateDto = {
          sessionToken: "session-token-123",
          newPassword: "NewSecurePass123!",
        } as unknown as UpdateUserDto;

        await expect(
          authDatasource.updateUserPassword(updateDto),
        ).rejects.toThrow(BadRequestError);
        await expect(
          authDatasource.updateUserPassword(updateDto),
        ).rejects.toThrow(ERRORS.AUTH.UPDATE_USER.USER_NOT_UPDATED);
      });

      it("should throw error when newPassword is missing", async () => {
        const updateDto = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-123",
        } as unknown as UpdateUserDto;

        await expect(
          authDatasource.updateUserPassword(updateDto),
        ).rejects.toThrow(BadRequestError);
        await expect(
          authDatasource.updateUserPassword(updateDto),
        ).rejects.toThrow(ERRORS.AUTH.UPDATE_USER.USER_NOT_UPDATED);
      });
    });

    describe("error handling", () => {
      it("should throw error when setSession fails", async () => {
        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: { message: "Invalid session", code: "invalid_session", status: 401 },
        });

        await expect(
          authDatasource.updateUserPassword(mockUpdateUserDto),
        ).rejects.toThrow(BadRequestError);
        await expect(
          authDatasource.updateUserPassword(mockUpdateUserDto),
        ).rejects.toThrow("Invalid session");
      });

      it("should throw error when updateUser fails", async () => {
        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: null,
        });

        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: null },
          error: { message: "Update failed", code: "update_error", status: 400 },
        });

        await expect(
          authDatasource.updateUserPassword(mockUpdateUserDto),
        ).rejects.toThrow(BadRequestError);
        await expect(
          authDatasource.updateUserPassword(mockUpdateUserDto),
        ).rejects.toThrow("Update failed");
      });

      it("should throw error when user is null after update", async () => {
        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: null,
        });

        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: null },
          error: null,
        });

        await expect(
          authDatasource.updateUserPassword(mockUpdateUserDto),
        ).rejects.toThrow(BadRequestError);
        await expect(
          authDatasource.updateUserPassword(mockUpdateUserDto),
        ).rejects.toThrow(ERRORS.AUTH.UPDATE_USER.USER_NOT_UPDATED);
      });

      it("should throw ValidationError when DatasourceUserDto creation fails", async () => {
        const mockUser = createMockUser();

        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: null,
        });

        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        const mockError = "Invalid user data";
        (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([
          mockError,
          undefined,
        ]);

        await expect(
          authDatasource.updateUserPassword(mockUpdateUserDto),
        ).rejects.toThrow(ValidationError);
      });
    });

    describe("integration and flow validation", () => {
      it("should follow the complete updateUserPassword flow", async () => {
        const mockUser = createMockUser();
        const mockDatasourceUserDto = createMockDatasourceUserDto();

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
        MockedAuthUserEntity.mockImplementation(() => ({}) as AuthUserEntity);

        await authDatasource.updateUserPassword(mockUpdateUserDto);

        // Verify the flow: AuthClient -> setSession -> updateUser -> DatasourceUserDto -> UserEntity -> AuthUserEntity
        expect(mockAuthClient.create).toHaveBeenCalled();
        expect(mockSupabaseClient.auth.setSession).toHaveBeenCalled();
        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalled();
        expect(MockedDatasourceUserDto.createFrom).toHaveBeenCalled();
        expect(MockedUserEntity.createFrom).toHaveBeenCalled();
        expect(MockedAuthUserEntity.createFrom).toHaveBeenCalled();
      });

      it("should maintain proper error propagation through the dependency chain", async () => {
        // Test error propagation from setSession
        mockSupabaseClient.auth.setSession.mockResolvedValue({
          error: { message: "Session error", code: "session_error", status: 401 },
        });

        await expect(
          authDatasource.updateUserPassword(mockUpdateUserDto),
        ).rejects.toThrow(BadRequestError);

        // Reset and test error propagation from updateUser
        mockSupabaseClient.auth.setSession.mockResolvedValue({ error: null });
        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: null },
          error: { message: "Update error", code: "update_error", status: 400 },
        });

        await expect(
          authDatasource.updateUserPassword(mockUpdateUserDto),
        ).rejects.toThrow(BadRequestError);
      });
    });
  });
});