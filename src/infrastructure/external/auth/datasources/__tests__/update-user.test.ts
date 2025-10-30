import { AuthDatasource } from "@/infrastructure/external/auth/datasources/auth.datasource";
import { AuthClient } from "@/infrastructure/external/auth/auth.client";
import { UpdateUserDto } from "@/domain/user/dtos/update-user.dto";
import { UserEntity } from "@/domain/user/entities/user.entity";
import { AuthUserEntity } from "@/domain/auth/entities/auth-user.entity";
import { DatasourceUserMapper } from "@/infrastructure/external/auth/mappers/datasource-user.mapper";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { ValidationError } from "@/domain/errors/validation-error";
import { ERROR_MESSAGES } from "@/domain/shared/constants/messages.constants";

// Mock dependencies
jest.mock("@/infrastructure/external/auth/auth.client");
jest.mock("@/domain/user/entities/user.entity");
jest.mock("@/infrastructure/external/auth/mappers/datasource-user.mapper");

const MockedAuthClient = AuthClient as jest.MockedClass<typeof AuthClient>;
const MockedUserEntity = UserEntity as jest.MockedClass<typeof UserEntity>;
const MockedDatasourceUserMapper = DatasourceUserMapper as jest.MockedClass<
  typeof DatasourceUserMapper
>;

describe("AuthDatasource - UpdateUser Functionality", () => {
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
      email: "john.doe@example.com",
      phone: "+1234567890",
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

  describe("updateUser method", () => {
    describe("successful update scenarios", () => {
      beforeEach(() => {
        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: { id: "user-123", email: "test@example.com" } },
          error: null,
        });
      });

      it("should successfully update user with all fields", async () => {
        const result = await authDatasource.updateUser(mockUpdateUserDto);

        expect(AuthDatasource["setSession"]).toHaveBeenCalledWith(
          mockSupabaseClient,
          mockUpdateUserDto.sessionToken,
          mockUpdateUserDto.refreshToken,
        );

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          email: mockUpdateUserDto.email,
          phone: mockUpdateUserDto.phone,
        });

        expect(result).toBeDefined();
        expect(result).toBe(mockAuthUserEntity);
      });

      it("should successfully update user with only email", async () => {
        const updateDto = {
          ...mockUpdateUserDto,
          phone: undefined,
        } as UpdateUserDto;

        await authDatasource.updateUser(updateDto);

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          email: updateDto.email,
        });
      });

      it("should successfully update user with only phone", async () => {
        const updateDto = {
          ...mockUpdateUserDto,
          email: undefined,
        } as UpdateUserDto;

        await authDatasource.updateUser(updateDto);

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          phone: updateDto.phone,
        });
      });

      it("should successfully update user with name and lastname only", async () => {
        const updateDto = {
          sessionToken: mockUpdateUserDto.sessionToken,
          refreshToken: mockUpdateUserDto.refreshToken,
          email: undefined,
          phone: undefined,
          name: "John",
          lastname: "Doe",
        } as UpdateUserDto;

        await authDatasource.updateUser(updateDto);

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          data: {
            name: "John",
            lastname: "Doe",
          },
        });
      });

      it("should successfully update user with only display_name", async () => {
        const updateDto = {
          sessionToken: mockUpdateUserDto.sessionToken,
          refreshToken: mockUpdateUserDto.refreshToken,
          email: undefined,
          phone: undefined,
          display_name: "John D.",
        } as UpdateUserDto;

        await authDatasource.updateUser(updateDto);

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          data: {
            display_name: "John D.",
          },
        });
      });

      it("should successfully update user with only role", async () => {
        const updateDto = {
          sessionToken: mockUpdateUserDto.sessionToken,
          refreshToken: mockUpdateUserDto.refreshToken,
          email: undefined,
          phone: undefined,
          role: "USER",
        } as UpdateUserDto;

        await authDatasource.updateUser(updateDto);

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          data: {
            role: "USER",
          },
        });
      });

      it("should successfully update user with only email_verified", async () => {
        const updateDto = {
          sessionToken: mockUpdateUserDto.sessionToken,
          refreshToken: mockUpdateUserDto.refreshToken,
          email: undefined,
          phone: undefined,
          email_verified: true,
        } as UpdateUserDto;

        await authDatasource.updateUser(updateDto);

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          data: {
            email_verified: true,
          },
        });
      });

      it("should successfully update user with combined fields including data object", async () => {
        const updateDto = {
          sessionToken: mockUpdateUserDto.sessionToken,
          refreshToken: mockUpdateUserDto.refreshToken,
          email: "new.email@example.com",
          phone: "+1987654321",
          name: "Jane",
          lastname: "Doe",
          display_name: "Jane D.",
          role: "ADMIN",
          email_verified: true,
        } as UpdateUserDto;

        await authDatasource.updateUser(updateDto);

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          email: "new.email@example.com",
          phone: "+1987654321",
          data: {
            name: "Jane",
            lastname: "Doe",
            display_name: "Jane D.",
            role: "ADMIN",
            email_verified: true,
          },
        });
      });

      it("should return AuthUserEntity", async () => {
        const result = await authDatasource.updateUser(mockUpdateUserDto);

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

        await expect(authDatasource.updateUser(invalidDto)).rejects.toThrow(
          BadRequestError,
        );
        await expect(authDatasource.updateUser(invalidDto)).rejects.toThrow(
          ERROR_MESSAGES.AUTH.UPDATE_USER.USER_NOT_UPDATED,
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
      });

      it("should reject requests with password", async () => {
        const updateDto = {
          ...mockUpdateUserDto,
          newPassword: "NewPassword123!",
        } as UpdateUserDto;

        await expect(authDatasource.updateUser(updateDto)).rejects.toThrow(
          BadRequestError,
        );
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
          authDatasource.updateUser(mockUpdateUserDto),
        ).rejects.toThrow(BadRequestError);
      });

      it("should throw error when user is null after update", async () => {
        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: null },
          error: null,
        });

        await expect(
          authDatasource.updateUser(mockUpdateUserDto),
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
          authDatasource.updateUser(mockUpdateUserDto),
        ).rejects.toThrow(ValidationError);
      });
    });

    describe("method behavior", () => {
      beforeEach(() => {
        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: { id: "user-123", email: "test@example.com" } },
          error: null,
        });
      });

      it("should call setSession before updating user", async () => {
        await authDatasource.updateUser(mockUpdateUserDto);

        expect(AuthDatasource["setSession"]).toHaveBeenCalled();
        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalled();
      });

      it("should handle empty update data", async () => {
        const emptyUpdateDto = {
          sessionToken: "session-token-123",
          refreshToken: "refresh-token-123",
        } as UpdateUserDto;

        await authDatasource.updateUser(emptyUpdateDto);

        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({});
      });
    });
  });
});
