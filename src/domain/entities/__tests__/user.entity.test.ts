import { UserEntity } from '../user.entity';
import { clearAllMocks } from '@/config/tests/test-utils';

describe('UserEntity', () => {
  afterEach(() => {
    clearAllMocks();
  });

  describe('constructor', () => {
    it('should create UserEntity instance with all required properties', () => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        email_verified: true,
        phone: '+1234567890'
      };

      const user = new UserEntity(
        userData.id,
        userData.email,
        userData.name,
        userData.email_verified,
        userData.phone
      );

      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('John Doe');
      expect(user.email_verified).toBe(true);
      expect(user.phone).toBe('+1234567890');
    });

    it('should create UserEntity instance without optional phone property', () => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        email_verified: true
      };

      const user = new UserEntity(
        userData.id,
        userData.email,
        userData.name,
        userData.email_verified
      );

      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('John Doe');
      expect(user.email_verified).toBe(true);
      expect(user.phone).toBeUndefined();
    });

    it('should create frozen object (immutable)', () => {
      const user = new UserEntity(
        'user-123',
        'test@example.com',
        'John Doe',
        true
      );

      expect(Object.isFrozen(user)).toBe(true);

      // Attempting to modify should not work
      expect(() => {
        // @ts-ignore
        user.id = 'new-id';
      }).toThrow();
    });
  });

  describe('createFrom', () => {
    it('should create UserEntity successfully with valid complete data', () => {
      const validData = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        email_verified: true,
        phone: '+1234567890'
      };

      const user = UserEntity.createFrom(validData);

      expect(user).toBeInstanceOf(UserEntity);
      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('John Doe');
      expect(user.email_verified).toBe(true);
      expect(user.phone).toBe('+1234567890');
    });

    it('should create UserEntity successfully without optional phone', () => {
      const validData = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        email_verified: true
      };

      const user = UserEntity.createFrom(validData);

      expect(user).toBeInstanceOf(UserEntity);
      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('John Doe');
      expect(user.email_verified).toBe(true);
      expect(user.phone).toBeUndefined();
    });

    it('should throw error when id is missing', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'John Doe',
        email_verified: true
      };

      expect(() => {
        UserEntity.createFrom(invalidData);
      }).toThrow('Invalid data');
    });

    it('should throw error when email is missing', () => {
      const invalidData = {
        id: 'user-123',
        name: 'John Doe',
        email_verified: true
      };

      expect(() => {
        UserEntity.createFrom(invalidData);
      }).toThrow('Invalid data');
    });

    it('should throw error when name is missing', () => {
      const invalidData = {
        id: 'user-123',
        email: 'test@example.com',
        email_verified: true
      };

      expect(() => {
        UserEntity.createFrom(invalidData);
      }).toThrow('Invalid data');
    });

    it('should throw error when email_verified is missing', () => {
      const invalidData = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe'
      };

      expect(() => {
        UserEntity.createFrom(invalidData);
      }).toThrow('Invalid data');
    });

    it('should throw error when id is empty string', () => {
      const invalidData = {
        id: '',
        email: 'test@example.com',
        name: 'John Doe',
        email_verified: true
      };

      expect(() => {
        UserEntity.createFrom(invalidData);
      }).toThrow('Invalid data');
    });

    it('should throw error when email is empty string', () => {
      const invalidData = {
        id: 'user-123',
        email: '',
        name: 'John Doe',
        email_verified: true
      };

      expect(() => {
        UserEntity.createFrom(invalidData);
      }).toThrow('Invalid data');
    });

    it('should throw error when name is empty string', () => {
      const invalidData = {
        id: 'user-123',
        email: 'test@example.com',
        name: '',
        email_verified: true
      };

      expect(() => {
        UserEntity.createFrom(invalidData);
      }).toThrow('Invalid data');
    });

    it('should throw error when fields are null', () => {
      const invalidData = {
        id: null,
        email: null,
        name: null,
        email_verified: null
      };

      expect(() => {
        UserEntity.createFrom(invalidData);
      }).toThrow('Invalid data');
    });

    it('should throw error when fields are undefined', () => {
      const invalidData = {
        id: undefined,
        email: undefined,
        name: undefined,
        email_verified: undefined
      };

      expect(() => {
        UserEntity.createFrom(invalidData);
      }).toThrow('Invalid data');
    });

    it('should handle extra properties in input data', () => {
      const dataWithExtraProps = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        email_verified: true,
        phone: '+1234567890',
        extraField: 'should be ignored',
        anotherField: 123
      };

      const user = UserEntity.createFrom(dataWithExtraProps);

      expect(user).toBeInstanceOf(UserEntity);
      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('John Doe');
      expect(user.email_verified).toBe(true);
      expect(user.phone).toBe('+1234567890');
      // @ts-ignore
      expect(user.extraField).toBeUndefined();
      // @ts-ignore
      expect(user.anotherField).toBeUndefined();
    });

    it('should throw error when email_verified is false (due to validation logic)', () => {
      const invalidData = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        email_verified: false
      };

      expect(() => {
        UserEntity.createFrom(invalidData);
      }).toThrow('Invalid data');
    });
  });
});