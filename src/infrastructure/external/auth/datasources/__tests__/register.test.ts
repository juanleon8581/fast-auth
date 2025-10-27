import { AuthDatasource } from "@/infrastructure/external/auth/datasources/auth.datasource";
import { AuthClient } from "@/infrastructure/external/auth/auth.client";
import { RegisterDto } from "@/domain/auth/dtos/register.dto";
import { UserEntity } from "@/domain/user/entities/user.entity";
import { AuthUserEntity } from "@/domain/auth/entities/auth-user.entity";
import { DatasourceUserMapper } from "@/infrastructure/external/auth/mappers/datasource-user.mapper";
import {
  createMockRegisterDto,
  createMockUser,
  createMockSession,
  createMockDatasourceUserMapper,
  createMockUserEntity,
  createMockAuthUserEntity,
} from "@/tests/__helpers__/auth-datasource.helpers";

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

describe("AuthDatasource - Register Functionality", () => {
  let authDatasource: AuthDatasource;
  let mockSupabaseClient: any;
  let mockAuthClient: any;
  let mockRegisterDto: RegisterDto;

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
    mockRegisterDto = createMockRegisterDto();

    // Create instance after mocks are set up
    authDatasource = new AuthDatasource(MockedAuthClient);
  });

  describe("constructor", () => {
    it("should create AuthDatasource instance", () => {
      expect(authDatasource).toBeInstanceOf(AuthDatasource);
    });

    it("should initialize AuthClient", () => {
      expect(authDatasource).toHaveProperty("client");
    });
  });

  describe("register method", () => {
    describe("successful registration", () => {
      beforeEach(() => {
        const mockUser = createMockUser();
        const mockSession = createMockSession();

        mockSupabaseClient.auth.signUp.mockResolvedValue({
          data: { user: mockUser, session: mockSession },
          error: null,
        });

        const mockDatasourceUserMapper = createMockDatasourceUserMapper();
        (MockedDatasourceUserMapper.createFrom as jest.Mock).mockReturnValue([
          undefined,
          mockDatasourceUserMapper,
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

      it("should call Supabase signUp with correct parameters", async () => {
        await authDatasource.register(mockRegisterDto);

        expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
          email: mockRegisterDto.email,
          password: mockRegisterDto.password,
          options: {
            data: {
              display_name: `${mockRegisterDto.name} ${mockRegisterDto.lastname}`,
            },
          },
        });
      });

      it("should create AuthClient and call create method", async () => {
        await authDatasource.register(mockRegisterDto);

        expect(MockedAuthClient).toHaveBeenCalledTimes(1);
        expect(mockAuthClient.create).toHaveBeenCalledTimes(1);
      });

      it("should create DatasourceUserMapper from Supabase user", async () => {
        await authDatasource.register(mockRegisterDto);

        expect(MockedDatasourceUserMapper.createFrom).toHaveBeenCalledWith({
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
        await authDatasource.register(mockRegisterDto);

        expect(MockedUserEntity.createFrom).toHaveBeenCalled();
      });

      it("should create and return AuthUserEntity", async () => {
        const result = await authDatasource.register(mockRegisterDto);

        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
      });
    });

    describe("error handling", () => {
      it("should throw error when Supabase returns error", async () => {
        const supabaseError = new Error("User already registered");

        mockSupabaseClient.auth.signUp.mockResolvedValue({
          data: { user: null },
          error: supabaseError,
        });

        await expect(authDatasource.register(mockRegisterDto)).rejects.toThrow(
          "User already registered",
        );
      });

      it("should throw error when user is null", async () => {
        mockSupabaseClient.auth.signUp.mockResolvedValue({
          data: { user: null },
          error: null,
        });

        await expect(authDatasource.register(mockRegisterDto)).rejects.toThrow(
          "User not created",
        );
      });

      it("should handle Supabase client creation failure", async () => {
        mockAuthClient.create.mockImplementation(() => {
          throw new Error("Failed to create Supabase client");
        });

        await expect(authDatasource.register(mockRegisterDto)).rejects.toThrow(
          "Failed to create Supabase client",
        );
      });

      it("should handle DatasourceUserMapper creation failure", async () => {
        const mockUser = {
          id: "user-123",
          email: "john.doe@example.com",
        };

        mockSupabaseClient.auth.signUp.mockResolvedValue({
          data: {
            user: mockUser,
            session: {
              access_token: "access-token-123",
              refresh_token: "refresh-token-123",
            },
          },
          error: null,
        });

        (MockedDatasourceUserMapper.createFrom as jest.Mock).mockImplementation(
          () => {
            throw new Error("Invalid user data");
          },
        );

        await expect(authDatasource.register(mockRegisterDto)).rejects.toThrow(
          "Invalid user data",
        );
      });
    });

    describe("method signature and return type", () => {
      it("should accept RegisterDto parameter", () => {
        expect(typeof authDatasource.register).toBe("function");
        expect(authDatasource.register.length).toBe(1);
      });

      it("should return Promise<AuthUserEntity>", async () => {
        const mockUser = createMockUser();
        const mockSession = createMockSession();

        mockSupabaseClient.auth.signUp.mockResolvedValue({
          data: {
            user: mockUser,
            session: mockSession,
          },
          error: null,
        });

        const mockDatasourceUserMapper = createMockDatasourceUserMapper();
        (MockedDatasourceUserMapper.createFrom as jest.Mock).mockReturnValue([
          undefined,
          mockDatasourceUserMapper,
        ]);

        const result = await authDatasource.register(mockRegisterDto);
        expect(result).toBeDefined();
        expect(typeof result).toBe("object");
      });

      it("should return UserEntity when session is null", async () => {
        const mockUser = createMockUser();

        mockSupabaseClient.auth.signUp.mockResolvedValue({
          data: {
            user: mockUser,
            session: null, // No session case
          },
          error: null,
        });

        const mockDatasourceUserMapper = createMockDatasourceUserMapper();
        (MockedDatasourceUserMapper.createFrom as jest.Mock).mockReturnValue([
          undefined,
          mockDatasourceUserMapper,
        ]);
        const mockUserEntity = createMockUserEntity();
        (MockedUserEntity.createFrom as jest.Mock).mockReturnValue(
          mockUserEntity,
        );

        const result = await authDatasource.register(mockRegisterDto);

        expect(result).toBe(mockUserEntity);
        expect(MockedUserEntity.createFrom).toHaveBeenCalledWith(
          mockDatasourceUserMapper,
        );
        expect(MockedAuthUserEntity.createFrom).not.toHaveBeenCalled();
      });
    });
  });

  describe("integration with dependencies", () => {
    it("should properly integrate with all dependencies", async () => {
      const mockUser = {
        id: "user-123",
        email: "john.doe@example.com",
        user_metadata: { name: "John", lastname: "Doe" },
        email_confirmed_at: "2024-01-01T00:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: mockUser,
          session: {
            access_token: "access-token-123",
            refresh_token: "refresh-token-123",
          },
        },
        error: null,
      });

      const mockDatasourceUserMapper = {
        id: "user-123",
        email: "john.doe@example.com",
        name: "John",
        lastname: "Doe",
        email_verified: true,
        created_at: new Date(),
      };

      (MockedDatasourceUserMapper.createFrom as jest.Mock).mockReturnValue([
        undefined,
        mockDatasourceUserMapper,
      ]);
      MockedUserEntity.mockImplementation(() => ({}) as UserEntity);
      MockedAuthUserEntity.mockImplementation(() => ({}) as AuthUserEntity);

      await authDatasource.register(mockRegisterDto);

      // Verify the flow: AuthClient -> Supabase -> DatasourceUserMapper -> UserEntity -> AuthUserEntity
      expect(mockAuthClient.create).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalled();
      expect(MockedDatasourceUserMapper.createFrom).toHaveBeenCalled();
      expect(MockedUserEntity.createFrom).toHaveBeenCalled();
      expect(AuthUserEntity.createFrom).toHaveBeenCalled();
    });
  });
});
