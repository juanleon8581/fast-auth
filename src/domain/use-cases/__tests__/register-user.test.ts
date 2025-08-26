import { RegisterUser } from '../register-user';
import { AuthRepository } from '../../repositories/auth.repository';
import { RegisterDto } from '../../dtos/register.dto';
import { AuthUserEntity } from '../../entities/auth-user.entity';
import { UserEntity } from '../../entities/user.entity';


// Mock implementation of AuthRepository for testing
class MockAuthRepository extends AuthRepository {
  private shouldFail: boolean = false;
  private mockResult: AuthUserEntity | null = null;

  setShouldFail(shouldFail: boolean) {
    this.shouldFail = shouldFail;
  }

  setMockResult(result: AuthUserEntity) {
    this.mockResult = result;
  }

  async register(registerDto: RegisterDto): Promise<AuthUserEntity> {
    if (this.shouldFail) {
      throw new Error('Repository registration failed');
    }

    if (this.mockResult) {
      return this.mockResult;
    }

    // Create a valid mock result
    const mockUser = new UserEntity(
      'user-123',
      registerDto.email,
      `${registerDto.name} ${registerDto.lastname}`,
      true,
      undefined
    );

    const mockAuthData = {
      user: mockUser,
      data: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token'
      }
    };

    return AuthUserEntity.createFrom(mockAuthData);
  }
}

describe('RegisterUser', () => {
  let registerUser: RegisterUser;
  let mockRepository: MockAuthRepository;

  beforeEach(() => {
    mockRepository = new MockAuthRepository();
    registerUser = new RegisterUser(mockRepository);
  });



  describe('constructor', () => {
    it('should create RegisterUser instance with repository dependency', () => {
      expect(registerUser).toBeInstanceOf(RegisterUser);
      expect(registerUser).toBeDefined();
    });

    it('should store repository reference', () => {
      // Access private property for testing
      expect((registerUser as any).repository).toBe(mockRepository);
    });
  });

  describe('execute', () => {
    it('should successfully register user with valid data', async () => {
      const registerDto = new RegisterDto(
        'John',
        'Doe',
        'john@example.com',
        'password123'
      );

      const result = await registerUser.execute(registerDto);

      expect(result).toBeInstanceOf(AuthUserEntity);
      if (result instanceof AuthUserEntity) {
        expect(result.user).toBeInstanceOf(UserEntity);
        expect(result.user.email).toBe('john@example.com');
        expect(result.user.name).toBe('John Doe');
        expect(result.accessToken).toBe('mock-access-token');
        expect(result.refreshToken).toBe('mock-refresh-token');
      }
    });

    it('should call repository register method with correct parameters', async () => {
      const registerDto = new RegisterDto(
        'Jane',
        'Smith',
        'jane@example.com',
        'password456'
      );

      const repositorySpy = jest.spyOn(mockRepository, 'register');

      await registerUser.execute(registerDto);

      expect(repositorySpy).toHaveBeenCalledTimes(1);
      expect(repositorySpy).toHaveBeenCalledWith(registerDto);
    });

    it('should propagate repository errors', async () => {
      const registerDto = new RegisterDto(
        'John',
        'Doe',
        'john@example.com',
        'password123'
      );

      mockRepository.setShouldFail(true);

      await expect(registerUser.execute(registerDto)).rejects.toThrow('Repository registration failed');
    });

    it('should handle different RegisterDto instances', async () => {
      const registerDto1 = new RegisterDto(
        'Alice',
        'Johnson',
        'alice@example.com',
        'password789'
      );

      const registerDto2 = new RegisterDto(
        'Bob',
        'Wilson',
        'bob@example.com',
        'password000'
      );

      const result1 = await registerUser.execute(registerDto1);
      const result2 = await registerUser.execute(registerDto2);

      if (result1 instanceof AuthUserEntity && result2 instanceof AuthUserEntity) {
        expect(result1.user.email).toBe('alice@example.com');
        expect(result1.user.name).toBe('Alice Johnson');
        expect(result2.user.email).toBe('bob@example.com');
        expect(result2.user.name).toBe('Bob Wilson');
      }
    });

    it('should return AuthUserEntity with correct structure', async () => {
      const registerDto = new RegisterDto(
        'Test',
        'User',
        'test@example.com',
        'testpassword'
      );

      const result = await registerUser.execute(registerDto);

      if (result instanceof AuthUserEntity) {
        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('refreshToken');
        expect(typeof result.accessToken).toBe('string');
        expect(typeof result.refreshToken).toBe('string');
        expect(result.accessToken.length).toBeGreaterThan(0);
        expect(result.refreshToken.length).toBeGreaterThan(0);
      }
    });

    it('should work with custom mock result', async () => {
      const customUser = new UserEntity(
        'custom-123',
        'custom@example.com',
        'Custom User',
        true,
        '+1234567890'
      );

      const customAuthData = {
        user: customUser,
        data: {
          access_token: 'custom-access-token',
          refresh_token: 'custom-refresh-token'
        }
      };

      const customAuthUser = AuthUserEntity.createFrom(customAuthData);
      mockRepository.setMockResult(customAuthUser);

      const registerDto = new RegisterDto(
        'Any',
        'Name',
        'any@example.com',
        'anypassword'
      );

      const result = await registerUser.execute(registerDto);

      if (result instanceof AuthUserEntity) {
        expect(result.user.id).toBe('custom-123');
        expect(result.user.email).toBe('custom@example.com');
        expect(result.user.name).toBe('Custom User');
        expect(result.accessToken).toBe('custom-access-token');
        expect(result.refreshToken).toBe('custom-refresh-token');
      }
    });
  });
});