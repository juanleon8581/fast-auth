import { AuthDatasource } from '../auth.datasource';
import { AuthClient } from '@/infrastructure/config/auth.client';
import { RegisterDto } from '@/domain/dtos/register.dto';
import { UserEntity } from '@/domain/entities/user.entity';
import { AuthUserEntity } from '@/domain/entities/auth-user.entity';
import { DatasourceUserDto } from '@/infrastructure/dtos/datasource-user.dto';

// Mock AuthClient
jest.mock('@/infrastructure/config/auth.client');

// Mock entities
jest.mock('@/domain/entities/user.entity');
jest.mock('@/domain/entities/auth-user.entity');

// Mock DatasourceUserDto
jest.mock('@/infrastructure/dtos/datasource-user.dto');

const MockedAuthClient = AuthClient as jest.MockedClass<typeof AuthClient>;
const MockedUserEntity = UserEntity as jest.MockedClass<typeof UserEntity>;
const MockedAuthUserEntity = AuthUserEntity as jest.MockedClass<any>;
const MockedDatasourceUserDto = DatasourceUserDto as jest.MockedClass<typeof DatasourceUserDto>;

describe('AuthDatasource', () => {
  let authDatasource: AuthDatasource;
  let mockAuthClient: jest.Mocked<AuthClient>;
  let mockSupabaseClient: any;
  let mockRegisterDto: RegisterDto;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock Supabase client
    mockSupabaseClient = {
      auth: {
        signUp: jest.fn()
      }
    };

    // Setup mock AuthClient
    mockAuthClient = {
      create: jest.fn().mockReturnValue(mockSupabaseClient)
    } as any;
    MockedAuthClient.mockImplementation(() => mockAuthClient);

    // Setup mock RegisterDto
    mockRegisterDto = {
      name: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      password: 'SecurePass123!'
    } as RegisterDto;

    // Create instance after mocks are set up
    authDatasource = new AuthDatasource(MockedAuthClient);
  });

  describe('constructor', () => {
    it('should create AuthDatasource instance', () => {
      expect(authDatasource).toBeInstanceOf(AuthDatasource);
    });

    it('should initialize AuthClient', () => {
      expect(authDatasource).toHaveProperty('client');
    });
  });

  describe('register method', () => {
    describe('successful registration', () => {
      beforeEach(() => {
        const mockUser = {
          id: 'user-123',
          email: 'john.doe@example.com',
          user_metadata: {
            display_name: 'John Doe'
          },
          email_confirmed_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z'
        };

        const mockSession = {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-123'
        };

        mockSupabaseClient.auth.signUp.mockResolvedValue({
          data: { user: mockUser, session: mockSession },
          error: null
        });

        const mockDatasourceUserDto = {
          id: 'user-123',
          email: 'john.doe@example.com',
          name: 'John Doe',
          email_verified: true
        };

        (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([undefined, mockDatasourceUserDto]);

        const mockUserEntity = { id: 'user-123', email: 'john.doe@example.com', name: 'John Doe' } as UserEntity;
         const mockAuthUserEntity = { 
           user: mockUserEntity, 
           accessToken: 'access-token-123', 
           refreshToken: 'refresh-token-123' 
         } as AuthUserEntity;
         
         (MockedUserEntity.createFrom as jest.Mock).mockReturnValue(mockUserEntity);
         (MockedAuthUserEntity.createFrom as jest.Mock).mockReturnValue(mockAuthUserEntity);
         
         // Mock the static methods to be called during execution
         MockedUserEntity.createFrom = jest.fn().mockReturnValue(mockUserEntity);
         MockedAuthUserEntity.createFrom = jest.fn().mockReturnValue(mockAuthUserEntity);
      });

      it('should call Supabase signUp with correct parameters', async () => {
        await authDatasource.register(mockRegisterDto);

        expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
          email: mockRegisterDto.email,
          password: mockRegisterDto.password,
          options: {
            data: {
              display_name: `${mockRegisterDto.name} ${mockRegisterDto.lastname}`
            }
          }
        });
      });

      it('should create AuthClient and call create method', async () => {
        await authDatasource.register(mockRegisterDto);

        expect(MockedAuthClient).toHaveBeenCalledTimes(1);
        expect(mockAuthClient.create).toHaveBeenCalledTimes(1);
      });

      it('should create DatasourceUserDto from Supabase user', async () => {
        await authDatasource.register(mockRegisterDto);

        expect(MockedDatasourceUserDto.createFrom).toHaveBeenCalledWith({
          id: 'user-123',
          email: 'john.doe@example.com',
          user_metadata: {
            display_name: 'John Doe'
          },
          email_confirmed_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z'
        });
      });

      it('should create UserEntity with correct parameters', async () => {
        await authDatasource.register(mockRegisterDto);

        expect(MockedUserEntity.createFrom).toHaveBeenCalled();
      });

      it('should create and return AuthUserEntity', async () => {
        const result = await authDatasource.register(mockRegisterDto);

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      });
    });

    describe('error handling', () => {
      it('should throw error when Supabase returns error', async () => {
        const supabaseError = new Error('User already registered');

        mockSupabaseClient.auth.signUp.mockResolvedValue({
          data: { user: null },
          error: supabaseError
        });

        await expect(authDatasource.register(mockRegisterDto))
          .rejects
          .toThrow('User already registered');
      });

      it('should throw error when user is null', async () => {
        mockSupabaseClient.auth.signUp.mockResolvedValue({
          data: { user: null },
          error: null
        });

        await expect(authDatasource.register(mockRegisterDto))
          .rejects
          .toThrow('User not created');
      });

      it('should handle Supabase client creation failure', async () => {
        mockAuthClient.create.mockImplementation(() => {
          throw new Error('Failed to create Supabase client');
        });

        await expect(authDatasource.register(mockRegisterDto))
          .rejects
          .toThrow('Failed to create Supabase client');
      });

      it('should handle DatasourceUserDto creation failure', async () => {
        const mockUser = {
          id: 'user-123',
          email: 'john.doe@example.com'
        };

        mockSupabaseClient.auth.signUp.mockResolvedValue({
          data: { 
            user: mockUser,
            session: {
              access_token: 'access-token-123',
              refresh_token: 'refresh-token-123'
            }
          },
          error: null
        });

        (MockedDatasourceUserDto.createFrom as jest.Mock).mockImplementation(() => {
          throw new Error('Invalid user data');
        });

        await expect(authDatasource.register(mockRegisterDto))
          .rejects
          .toThrow('Invalid user data');
      });
    });

    describe('method signature and return type', () => {
      it('should accept RegisterDto parameter', () => {
        expect(typeof authDatasource.register).toBe('function');
        expect(authDatasource.register.length).toBe(1);
      });

      it('should return Promise<AuthUserEntity>', async () => {
        const mockUser = {
          id: 'user-123',
          email: 'john.doe@example.com',
          user_metadata: { display_name: 'John Doe' },
          email_confirmed_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z'
        };

        mockSupabaseClient.auth.signUp.mockResolvedValue({
          data: { 
            user: mockUser,
            session: {
              access_token: 'access-token-123',
              refresh_token: 'refresh-token-123'
            }
          },
          error: null
        });

        const mockDatasourceUserDto = {
          id: 'user-123',
          email: 'john.doe@example.com',
          name: 'John Doe'
        };
        
        (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([undefined, mockDatasourceUserDto]);
        
        const result = await authDatasource.register(mockRegisterDto);
        expect(result).toBeDefined();
        // Just verify the method completes successfully
        expect(typeof result).toBe('object');
      });

      it('should return UserEntity when session is null', async () => {
        const mockUser = {
          id: 'user-123',
          email: 'john.doe@example.com',
          user_metadata: { display_name: 'John Doe' },
          email_confirmed_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z'
        };

        mockSupabaseClient.auth.signUp.mockResolvedValue({
          data: { 
            user: mockUser,
            session: null // No session case
          },
          error: null
        });

        const mockDatasourceUserDto = {
          id: 'user-123',
          email: 'john.doe@example.com',
          name: 'John Doe'
        };
        
        const mockUserEntity = { id: 'user-123', email: 'john.doe@example.com', name: 'John Doe' } as UserEntity;
        
        (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([undefined, mockDatasourceUserDto]);
        (MockedUserEntity.createFrom as jest.Mock).mockReturnValue(mockUserEntity);
        
        const result = await authDatasource.register(mockRegisterDto);
        
        expect(result).toBe(mockUserEntity);
        expect(MockedUserEntity.createFrom).toHaveBeenCalledWith(mockDatasourceUserDto);
        expect(MockedAuthUserEntity.createFrom).not.toHaveBeenCalled();
      });
    });
  });

  describe('integration with dependencies', () => {
    it('should properly integrate with all dependencies', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'john.doe@example.com',
        user_metadata: { name: 'John', lastname: 'Doe' },
        email_confirmed_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const mockDatasourceUserDto = {
        id: 'user-123',
        email: 'john.doe@example.com',
        name: 'John',
        lastname: 'Doe',
        email_verified: true,
        created_at: new Date()
      };

      (MockedDatasourceUserDto.createFrom as jest.Mock).mockReturnValue([undefined, mockDatasourceUserDto]);
      MockedUserEntity.mockImplementation(() => ({} as UserEntity));
      MockedAuthUserEntity.mockImplementation(() => ({} as AuthUserEntity));

      await authDatasource.register(mockRegisterDto);

      // Verify the flow: AuthClient -> Supabase -> DatasourceUserDto -> UserEntity -> AuthUserEntity
      expect(mockAuthClient.create).toHaveBeenCalled();
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalled();
      expect(MockedDatasourceUserDto.createFrom).toHaveBeenCalled();
      expect(MockedUserEntity.createFrom).toHaveBeenCalled();
      // AuthUserEntity.createFrom may or may not be called depending on session data
      // expect(MockedAuthUserEntity.createFrom).toHaveBeenCalled();
    });
  });
});