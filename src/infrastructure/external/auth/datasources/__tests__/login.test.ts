import { AuthDatasource } from "@/infrastructure/external/auth/datasources/auth.datasource";
import { AuthClient } from "@/infrastructure/external/auth/auth.client";
import { LoginDto } from "@/domain/auth/dtos/login.dto";
import { UserEntity } from "@/domain/user/entities/user.entity";
import { AuthUserEntity } from "@/domain/auth/entities/auth-user.entity";
import { DatasourceUserDto } from "@/infrastructure/dtos/datasource-user.dto";
import {
  createMockLoginDto,
  createMockUser,
  createMockSession,
  createMockDatasourceUserDto,
  createMockUserEntity,
  createMockAuthUserEntity,
} from "@/config/__tests__/__helpers__/auth-datasource.helpers";

// Mock dependencies
jest.mock("@/infrastructure/external/auth/auth.client");
jest.mock("@/domain/user/entities/user.entity");
jest.mock("@/domain/auth/entities/auth-user.entity");
jest.mock("@/infrastructure/dtos/datasource-user.dto");

const MockedAuthClient = AuthClient as jest.MockedClass<typeof AuthClient>;
const MockedUserEntity = UserEntity as jest.MockedClass<typeof UserEntity>;
const MockedAuthUserEntity = AuthUserEntity as jest.MockedClass<any>;
const MockedDatasourceUserDto = DatasourceUserDto as jest.MockedClass<
  typeof DatasourceUserDto
>;

describe("AuthDatasource - Login Functionality", () => {
  let authDatasource: AuthDatasource;
  let mockSupabaseClient: any;
  let mockAuthClient: any;
  let mockLoginDto: LoginDto;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabaseClient = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        setSession: jest.fn(),
        signOut: jest.fn(),
      },
    };

    // Create mock AuthClient
    mockAuthClient = {
      create: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    MockedAuthClient.mockImplementation(() => mockAuthClient);

    // Create test data
    mockLoginDto = createMockLoginDto();

    // Create instance after mocks are set up
    authDatasource = new AuthDatasource(MockedAuthClient);
  });

  describe("login method", () => {
    describe("successful login", () => {
      beforeEach(() => {
        const mockUser = createMockUser();
        const mockSession = createMockSession();

        mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockUser, session: mockSession },
          error: null,
        });

        const mockDatasourceUserDto = createMockDatasourceUserDto();
        (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([
          undefined,
          mockDatasourceUserDto,
        ]);

        const mockUserEntity = createMockUserEntity();
        const mockAuthUserEntity = createMockAuthUserEntity();

        (MockedUserEntity.createFrom as jest.Mock).mockReturnValue(
          mockUserEntity,
        );
        (MockedAuthUserEntity.createFrom as jest.Mock).mockReturnValue(
          mockAuthUserEntity,
        );

        // Mock the static methods to be called during execution
        MockedUserEntity.createFrom = jest.fn().mockReturnValue(mockUserEntity);
        MockedAuthUserEntity.createFrom = jest
          .fn()
          .mockReturnValue(mockAuthUserEntity);
      });

      it("should call Supabase signInWithPassword with correct parameters", async () => {
        await authDatasource.login(mockLoginDto);

        expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith(
          {
            email: mockLoginDto.email,
            password: mockLoginDto.password,
          },
        );
      });

      it("should create AuthClient and call create method", async () => {
        await authDatasource.login(mockLoginDto);

        expect(MockedAuthClient).toHaveBeenCalledTimes(1);
        expect(mockAuthClient.create).toHaveBeenCalledTimes(1);
      });

      it("should create DatasourceUserDto from Supabase user", async () => {
        await authDatasource.login(mockLoginDto);

        expect(MockedDatasourceUserDto.createFrom).toHaveBeenCalledWith({
          id: "user-123",
          email: "john.doe@example.com",
          user_metadata: {
            display_name: "John Doe",
          },
          email_confirmed_at: "2024-01-01T00:00:00Z",
          created_at: "2024-01-01T00:00:00Z",
        });
      });

      it("should create UserEntity with correct parameters", async () => {
        await authDatasource.login(mockLoginDto);

        expect(MockedUserEntity.createFrom).toHaveBeenCalled();
      });

      it("should create and return AuthUserEntity", async () => {
        const result = await authDatasource.login(mockLoginDto);

        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
        expect(MockedAuthUserEntity.createFrom).toHaveBeenCalled();
      });
    });

    describe("error handling", () => {
      it("should throw error when Supabase returns error", async () => {
        const supabaseError = {
          message: "Invalid credentials",
          code: "invalid_credentials",
          status: 400,
        };

        mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: null, session: null },
          error: supabaseError,
        });

        await expect(authDatasource.login(mockLoginDto)).rejects.toThrow(
          "Invalid credentials",
        );
      });

      it("should throw error when session is null", async () => {
        const mockUser = createMockUser();

        mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockUser, session: null },
          error: null,
        });

        await expect(authDatasource.login(mockLoginDto)).rejects.toThrow(
          "User not found",
        );
      });

      it("should handle Supabase client creation failure", async () => {
        mockAuthClient.create.mockImplementation(() => {
          throw new Error("Failed to create Supabase client");
        });

        await expect(authDatasource.login(mockLoginDto)).rejects.toThrow(
          "Failed to create Supabase client",
        );
      });

      it("should handle DatasourceUserDto creation failure", async () => {
        const mockUser = createMockUser();
        const mockSession = createMockSession();

        mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockUser, session: mockSession },
          error: null,
        });

        (MockedDatasourceUserDto.createFrom as jest.Mock).mockImplementation(
          () => {
            throw new Error("Invalid user data");
          },
        );

        await expect(authDatasource.login(mockLoginDto)).rejects.toThrow(
          "Invalid user data",
        );
      });
    });

    describe("method signature and return type", () => {
      it("should accept LoginDto parameter", () => {
        expect(typeof authDatasource.login).toBe("function");
        expect(authDatasource.login.length).toBe(1);
      });

      it("should return Promise<AuthUserEntity>", async () => {
        const mockUser = createMockUser();
        const mockSession = createMockSession();

        mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockUser, session: mockSession },
          error: null,
        });

        const mockDatasourceUserDto = createMockDatasourceUserDto();
        const mockUserEntity = createMockUserEntity();
        const mockAuthUserEntity = createMockAuthUserEntity();

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

        const result = await authDatasource.login(mockLoginDto);

        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
        expect(result).toBe(mockAuthUserEntity);
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

      const mockSession = {
        access_token: "access-token-123",
        refresh_token: "refresh-token-123",
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const mockDatasourceUserDto = {
        id: "user-123",
        email: "john.doe@example.com",
        name: "John Doe",
        email_verified: true,
        created_at: new Date(),
      };

      (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([
        undefined,
        mockDatasourceUserDto,
      ]);
      MockedUserEntity.mockImplementation(() => ({}) as UserEntity);
      MockedAuthUserEntity.mockImplementation(() => ({}) as AuthUserEntity);

      await authDatasource.login(mockLoginDto);

      // Verify the flow: AuthClient -> Supabase -> DatasourceUserDto -> UserEntity -> AuthUserEntity
      expect(mockAuthClient.create).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalled();
      expect(MockedDatasourceUserDto.createFrom).toHaveBeenCalled();
      expect(MockedUserEntity.createFrom).toHaveBeenCalled();
      expect(MockedAuthUserEntity.createFrom).toHaveBeenCalled();
    });
  });
});
