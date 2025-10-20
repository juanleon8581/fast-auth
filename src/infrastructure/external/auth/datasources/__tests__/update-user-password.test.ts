import { AuthDatasource } from "@/infrastructure/external/auth/datasources/auth.datasource";
import { AuthClient } from "@/infrastructure/external/auth/auth.client";
import { UpdateUserDto } from "@/domain/user/dtos/update-user.dto";
import { AuthUserEntity } from "@/domain/auth/entities/auth-user.entity";
import { UserEntity } from "@/domain/user/entities/user.entity";
import { DatasourceUserMapper } from "@/infrastructure/external/auth/mappers/datasource-user.mapper";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { ValidationError } from "@/domain/errors/validation-error";
import { ERRORS } from "@/config/strings/global.strings.json";

// Mock dependencies
jest.mock("@/infrastructure/external/auth/auth.client");
jest.mock("@/domain/user/entities/user.entity");
jest.mock("@/infrastructure/external/auth/mappers/datasource-user.mapper");

const MockedAuthClient = AuthClient as jest.MockedClass<typeof AuthClient>;
const MockedUserEntity = UserEntity as jest.MockedClass<typeof UserEntity>;
const MockedDatasourceUserMapper = DatasourceUserMapper as jest.MockedClass<
  typeof DatasourceUserMapper
>;

describe("AuthDatasource - UpdateUserPassword Functionality", () => {
  let authDatasource: AuthDatasource;
  let mockSupabaseClient: any;
  let mockAuthClient: any;
  let mockUpdateUserDto: UpdateUserDto;
  let mockUserEntity: UserEntity;
  let mockAuthUserEntity: AuthUserEntity;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create simple mock entities
    mockUserEntity = {
      id: "user-123",
      email: "test@example.com",
    } as UserEntity;
    mockAuthUserEntity = {
      user: mockUserEntity,
      accessToken: "access-token",
      refreshToken: "refresh-token",
    } as AuthUserEntity;

    // Create mock Supabase client with minimal required methods
    mockSupabaseClient = {
      auth: {
        setSession: jest.fn(),
        refreshSession: jest.fn(),
        updateUser: jest.fn(),
      },
    };

    // Create mock AuthClient
    mockAuthClient = {
      create: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    MockedAuthClient.mockImplementation(() => mockAuthClient);

    // Mock static methods to return simple values
    (MockedUserEntity.createFrom as jest.Mock).mockReturnValue(mockUserEntity);
    (MockedDatasourceUserMapper.createFrom as jest.Mock).mockReturnValue([
      undefined,
      { id: "user-123" },
    ]);

    // Mock AuthUserEntity.createFrom directly
    jest
      .spyOn(AuthUserEntity, "createFrom")
      .mockReturnValue(mockAuthUserEntity);

    // Create test data
    mockUpdateUserDto = {
      sessionToken: "session-token-123",
      refreshToken: "refresh-token-123",
      newPassword: "NewPassword123!",
    } as UpdateUserDto;

    // Mock the setSession static method directly to avoid complex dependencies
    jest
      .spyOn(AuthDatasource as any, "setSession")
      .mockResolvedValue(mockAuthUserEntity);

    authDatasource = new AuthDatasource(MockedAuthClient);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("updateUserPassword method", () => {
    describe("successful password update scenarios", () => {
      beforeEach(() => {
        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: { id: "user-123", email: "test@example.com" } },
          error: null,
        });
      });

      it("should successfully update user password", async () => {
        const result =
          await authDatasource.updateUserPassword(mockUpdateUserDto);

        expect(AuthDatasource["setSession"]).toHaveBeenCalledWith(
          mockSupabaseClient,
          mockUpdateUserDto.sessionToken,
          mockUpdateUserDto.refreshToken,
        );

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          password: mockUpdateUserDto.newPassword,
        });

        expect(result).toBeDefined();
        expect(result).toBe(mockAuthUserEntity);
      });

      it("should return AuthUserEntity", async () => {
        const result =
          await authDatasource.updateUserPassword(mockUpdateUserDto);

        expect(result).toBeDefined();
        expect(result).toBe(mockAuthUserEntity);
      });
    });

    describe("validation and error handling", () => {
      it("should throw error when sessionToken is missing", async () => {
        const invalidDto = {
          ...mockUpdateUserDto,
          sessionToken: "",
        } as UpdateUserDto;

        await expect(
          authDatasource.updateUserPassword(invalidDto),
        ).rejects.toThrow(BadRequestError);
        await expect(
          authDatasource.updateUserPassword(invalidDto),
        ).rejects.toThrow(ERRORS.AUTH.UPDATE_USER.USER_NOT_UPDATED);
      });

      it("should throw error when refreshToken is missing", async () => {
        const invalidDto = {
          ...mockUpdateUserDto,
          refreshToken: "",
        } as UpdateUserDto;

        await expect(
          authDatasource.updateUserPassword(invalidDto),
        ).rejects.toThrow(BadRequestError);
      });

      it("should throw error when newPassword is missing", async () => {
        const invalidDto = {
          ...mockUpdateUserDto,
          newPassword: "",
        } as UpdateUserDto;

        await expect(
          authDatasource.updateUserPassword(invalidDto),
        ).rejects.toThrow(BadRequestError);
      });

      it("should throw error when updateUser fails", async () => {
        const updateError = {
          message: "Update failed",
          code: "update_failed",
          status: 400,
        };

        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: null },
          error: updateError,
        });

        await expect(
          authDatasource.updateUserPassword(mockUpdateUserDto),
        ).rejects.toThrow(BadRequestError);
      });

      it("should throw error when user is null after update", async () => {
        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: null },
          error: null,
        });

        await expect(
          authDatasource.updateUserPassword(mockUpdateUserDto),
        ).rejects.toThrow(BadRequestError);
      });

      it("should handle DatasourceUserMapper creation failure", async () => {
        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: { id: "user-123" } },
          error: null,
        });

        (MockedDatasourceUserMapper.createFrom as jest.Mock).mockReturnValue([
          "Invalid user data",
          undefined,
        ]);

        await expect(
          authDatasource.updateUserPassword(mockUpdateUserDto),
        ).rejects.toThrow(ValidationError);
      });
    });

    describe("integration and flow validation", () => {
      beforeEach(() => {
        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: { id: "user-123", email: "test@example.com" } },
          error: null,
        });
      });

      it("should call setSession before updating password", async () => {
        await authDatasource.updateUserPassword(mockUpdateUserDto);

        expect(AuthDatasource["setSession"]).toHaveBeenCalled();
        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalled();
      });

      it("should maintain proper error propagation through the dependency chain", async () => {
        const updateError = {
          message: "Password update failed",
          code: "password_update_failed",
          status: 400,
        };

        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: null },
          error: updateError,
        });

        await expect(
          authDatasource.updateUserPassword(mockUpdateUserDto),
        ).rejects.toThrow(BadRequestError);
      });
    });
  });
});
