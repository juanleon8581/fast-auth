import { AuthUserEntity } from '../auth-user.entity';
import { UserEntity } from '../user.entity';
import { clearAllMocks } from '@/config/tests/test-utils';

describe('AuthUserEntity', () => {
  afterEach(() => {
    clearAllMocks();
  });

  const mockUserEntity = new UserEntity(
    'user-123',
    'test@example.com',
    'John Doe',
    true,
    '+1234567890'
  );

  // Note: Constructor is private, so we test through createFrom method

  describe('createFrom', () => {
    it('should create AuthUserEntity successfully with valid complete data', () => {
      const validData = {
        user: mockUserEntity,
        data: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-456'
        }
      };

      const authUser = AuthUserEntity.createFrom(validData);

      expect(authUser).toBeInstanceOf(AuthUserEntity);
      expect(authUser.user).toBe(mockUserEntity);
      expect(authUser.accessToken).toBe('access-token-123');
      expect(authUser.refreshToken).toBe('refresh-token-456');
    });

    it('should create frozen object (immutable)', () => {
      const validData = {
        user: mockUserEntity,
        data: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-456'
        }
      };

      const authUser = AuthUserEntity.createFrom(validData);

      expect(Object.isFrozen(authUser)).toBe(true);

      // Attempting to modify should not work
      expect(() => {
        // @ts-ignore
        authUser.accessToken = 'new-token';
      }).toThrow();
    });

    it('should throw error when user data is missing', () => {
      const invalidData = {
        data: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-456'
        }
      };

      expect(() => {
        // @ts-ignore
        AuthUserEntity.createFrom(invalidData);
      }).toThrow('Invalid auth user data');
    });

    it('should throw error when access_token is missing', () => {
      const invalidData = {
        user: mockUserEntity,
        data: {
          refresh_token: 'refresh-token-456'
        }
      };

      expect(() => {
        AuthUserEntity.createFrom(invalidData);
      }).toThrow('Invalid auth user data');
    });

    it('should throw error when refresh_token is missing', () => {
      const invalidData = {
        user: mockUserEntity,
        data: {
          access_token: 'access-token-123'
        }
      };

      expect(() => {
        AuthUserEntity.createFrom(invalidData);
      }).toThrow('Invalid auth user data');
    });

    it('should throw error when access_token is empty string', () => {
      const invalidData = {
        user: mockUserEntity,
        data: {
          access_token: '',
          refresh_token: 'refresh-token-456'
        }
      };

      expect(() => {
        AuthUserEntity.createFrom(invalidData);
      }).toThrow('Invalid auth user data');
    });

    it('should throw error when refresh_token is empty string', () => {
      const invalidData = {
        user: mockUserEntity,
        data: {
          access_token: 'access-token-123',
          refresh_token: ''
        }
      };

      expect(() => {
        AuthUserEntity.createFrom(invalidData);
      }).toThrow('Invalid auth user data');
    });

    it('should throw error when user is not UserEntity instance', () => {
      const invalidData = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'John Doe',
          email_verified: true
        },
        data: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-456'
        }
      };

      expect(() => {
        // @ts-ignore
        AuthUserEntity.createFrom(invalidData);
      }).toThrow('Invalid auth user data');
    });

    it('should throw error when tokens are null', () => {
      const invalidData = {
        user: mockUserEntity,
        data: {
          access_token: null,
          refresh_token: null
        }
      };

      expect(() => {
        // @ts-ignore
        AuthUserEntity.createFrom(invalidData);
      }).toThrow('Invalid auth user data');
    });

    it('should throw error when tokens are undefined', () => {
      const invalidData = {
        user: mockUserEntity,
        data: {
          access_token: undefined,
          refresh_token: undefined
        }
      };

      expect(() => {
        // @ts-ignore
        AuthUserEntity.createFrom(invalidData);
      }).toThrow('Invalid auth user data');
    });

    it('should handle extra properties in data', () => {
      const dataWithExtraProps = {
        user: mockUserEntity,
        data: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-456',
          extraField: 'should be ignored',
          anotherField: 123
        }
      };

      const authUser = AuthUserEntity.createFrom(dataWithExtraProps);

      expect(authUser).toBeInstanceOf(AuthUserEntity);
      expect(authUser.user).toBe(mockUserEntity);
      expect(authUser.accessToken).toBe('access-token-123');
      expect(authUser.refreshToken).toBe('refresh-token-456');
    });
  });
});