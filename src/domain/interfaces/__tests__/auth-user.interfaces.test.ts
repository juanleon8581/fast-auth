import { IAuthUserEntityFromRaw, IAuthUserEntity } from '../auth-user.interfaces';
import { UserEntity } from '../../entities/user.entity';
import { AuthUserEntity } from '../../entities/auth-user.entity';

describe('Auth User Interfaces', () => {
  let mockUser: UserEntity;

  beforeEach(() => {
    mockUser = new UserEntity(
      'user-123',
      'test@example.com',
      'Test User',
      true,
      '+1234567890'
    );
  });

  describe('IAuthUserEntityFromRaw', () => {
    it('should accept valid structure with UserEntity and data object', () => {
      const validData: IAuthUserEntityFromRaw = {
        user: mockUser,
        data: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token'
        }
      };

      expect(validData.user).toBeInstanceOf(UserEntity);
      expect(validData.data).toBeDefined();
      expect(typeof validData.data).toBe('object');
    });

    it('should accept data object with any key-value pairs', () => {
      const validData: IAuthUserEntityFromRaw = {
        user: mockUser,
        data: {
          access_token: 'token1',
          refresh_token: 'token2',
          expires_in: 3600,
          token_type: 'Bearer',
          custom_field: 'custom_value'
        }
      };

      expect(validData.data.access_token).toBe('token1');
      expect(validData.data.expires_in).toBe(3600);
      expect(validData.data.custom_field).toBe('custom_value');
    });

    it('should require user property of type UserEntity', () => {
      const validData: IAuthUserEntityFromRaw = {
        user: mockUser,
        data: {}
      };

      expect(validData.user).toBeInstanceOf(UserEntity);
      expect(validData.user.id).toBe('user-123');
      expect(validData.user.email).toBe('test@example.com');
    });

    it('should require data property as object', () => {
      const validData: IAuthUserEntityFromRaw = {
        user: mockUser,
        data: {}
      };

      expect(validData.data).toBeDefined();
      expect(typeof validData.data).toBe('object');
      expect(validData.data).not.toBeNull();
    });
  });

  describe('IAuthUserEntity', () => {
    it('should accept valid structure with UserEntity and token strings', () => {
      const validAuthUser: IAuthUserEntity = {
        user: mockUser,
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token'
      };

      expect(validAuthUser.user).toBeInstanceOf(UserEntity);
      expect(typeof validAuthUser.accessToken).toBe('string');
      expect(typeof validAuthUser.refreshToken).toBe('string');
    });

    it('should require user property of type UserEntity', () => {
      const validAuthUser: IAuthUserEntity = {
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      expect(validAuthUser.user).toBeInstanceOf(UserEntity);
      expect(validAuthUser.user.id).toBe('user-123');
      expect(validAuthUser.user.email).toBe('test@example.com');
      expect(validAuthUser.user.name).toBe('Test User');
    });

    it('should require accessToken as string', () => {
      const validAuthUser: IAuthUserEntity = {
        user: mockUser,
        accessToken: 'test-access-token-123',
        refreshToken: 'test-refresh-token'
      };

      expect(typeof validAuthUser.accessToken).toBe('string');
      expect(validAuthUser.accessToken).toBe('test-access-token-123');
      expect(validAuthUser.accessToken.length).toBeGreaterThan(0);
    });

    it('should require refreshToken as string', () => {
      const validAuthUser: IAuthUserEntity = {
        user: mockUser,
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token-456'
      };

      expect(typeof validAuthUser.refreshToken).toBe('string');
      expect(validAuthUser.refreshToken).toBe('test-refresh-token-456');
      expect(validAuthUser.refreshToken.length).toBeGreaterThan(0);
    });
  });

  describe('Interface compatibility with AuthUserEntity', () => {
    it('should be compatible with AuthUserEntity structure', () => {
      const authData: IAuthUserEntityFromRaw = {
        user: mockUser,
        data: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token'
        }
      };

      const authUserEntity = AuthUserEntity.createFrom(authData);

      // Verify that AuthUserEntity implements IAuthUserEntity interface
      const authUserAsInterface: IAuthUserEntity = {
        user: authUserEntity.user,
        accessToken: authUserEntity.accessToken,
        refreshToken: authUserEntity.refreshToken
      };

      expect(authUserAsInterface.user).toBeInstanceOf(UserEntity);
      expect(typeof authUserAsInterface.accessToken).toBe('string');
      expect(typeof authUserAsInterface.refreshToken).toBe('string');
    });

    it('should validate interface structure matches entity properties', () => {
      const authData: IAuthUserEntityFromRaw = {
        user: mockUser,
        data: {
          access_token: 'access-123',
          refresh_token: 'refresh-456'
        }
      };

      const authUserEntity = AuthUserEntity.createFrom(authData);

      // Test that entity satisfies interface requirements
      expect(authUserEntity.user).toBe(mockUser);
      expect(authUserEntity.accessToken).toBe('access-123');
      expect(authUserEntity.refreshToken).toBe('refresh-456');
    });
  });
});