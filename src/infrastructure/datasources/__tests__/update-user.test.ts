import { AuthDatasource } from "../auth.datasource";
import { AuthClient } from "@/infrastructure/config/auth.client";
import { UpdateUserDto } from "@/domain/dtos/update-user.dto";
import { UserEntity } from "@/domain/entities/user.entity";
import { AuthUserEntity } from "@/domain/entities/auth-user.entity";
import { DatasourceUserDto } from "@/infrastructure/dtos/datasource-user.dto";
import { BadRequestError } from "@/domain/errors/bad-request-error";
import { ValidationError } from "@/domain/errors/validation-error";
import { ERRORS } from "@/config/strings/global.strings.json";

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
    (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([
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
          ERRORS.AUTH.UPDATE_USER.USER_NOT_UPDATED,
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

      it("should handle DatasourceUserDto creation failure", async () => {
        mockSupabaseClient.auth.updateUser.mockResolvedValue({
          data: { user: { id: "user-123" } },
          error: null,
        });

        (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([
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
