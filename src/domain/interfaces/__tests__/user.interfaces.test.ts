import { IUserData } from '../user.interfaces';
import { UserEntity } from '../../entities/user.entity';

describe('User Interfaces', () => {
  describe('IUserData', () => {
    it('should accept valid user data structure with all required fields', () => {
      const validUserData: IUserData = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        email_verified: true,
        phone: '+1234567890'
      };

      expect(validUserData.id).toBe('user-123');
      expect(validUserData.email).toBe('test@example.com');
      expect(validUserData.name).toBe('Test User');
      expect(validUserData.email_verified).toBe(true);
      expect(validUserData.phone).toBe('+1234567890');
    });

    it('should accept valid user data structure without optional phone field', () => {
      const validUserData: IUserData = {
        id: 'user-456',
        email: 'user@example.com',
        name: 'Another User',
        email_verified: false
      };

      expect(validUserData.id).toBe('user-456');
      expect(validUserData.email).toBe('user@example.com');
      expect(validUserData.name).toBe('Another User');
      expect(validUserData.email_verified).toBe(false);
      expect(validUserData.phone).toBeUndefined();
    });

    it('should enforce type constraints for all properties', () => {
      const userData: IUserData = {
        id: 'test-id',
        email: 'test@test.com',
        name: 'Test Name',
        email_verified: true
      };

      expect(typeof userData.id).toBe('string');
      expect(typeof userData.email).toBe('string');
      expect(typeof userData.name).toBe('string');
      expect(typeof userData.email_verified).toBe('boolean');
    });

    it('should allow phone field to be optional', () => {
      const userDataWithPhone: IUserData = {
        id: 'user-1',
        email: 'user1@example.com',
        name: 'User One',
        email_verified: true,
        phone: '+1234567890'
      };

      const userDataWithoutPhone: IUserData = {
        id: 'user-2',
        email: 'user2@example.com',
        name: 'User Two',
        email_verified: false
      };

      expect(userDataWithPhone.phone).toBe('+1234567890');
      expect(userDataWithoutPhone.phone).toBeUndefined();
    });

    it('should be compatible with UserEntity constructor parameters', () => {
      const userData: IUserData = {
        id: 'entity-test-id',
        email: 'entity@test.com',
        name: 'Entity Test User',
        email_verified: true,
        phone: '+9876543210'
      };

      const userEntity = new UserEntity(
        userData.id,
        userData.email,
        userData.name,
        userData.email_verified,
        userData.phone
      );

      expect(userEntity.id).toBe(userData.id);
      expect(userEntity.email).toBe(userData.email);
      expect(userEntity.name).toBe(userData.name);
      expect(userEntity.email_verified).toBe(userData.email_verified);
      expect(userEntity.phone).toBe(userData.phone);
    });

    it('should be compatible with UserEntity properties', () => {
      const userData: IUserData = {
        id: 'prop-test-id',
        email: 'prop@test.com',
        name: 'Property Test User',
        email_verified: false
      };

      const userEntity = new UserEntity(
        userData.id,
        userData.email,
        userData.name,
        userData.email_verified,
        userData.phone
      );

      expect(userEntity.id).toBe(userData.id);
      expect(userEntity.email).toBe(userData.email);
      expect(userEntity.name).toBe(userData.name);
      expect(userEntity.email_verified).toBe(userData.email_verified);
      expect(userEntity.phone).toBe(userData.phone);
    });

    it('should handle boolean email_verified field correctly', () => {
      const verifiedUser: IUserData = {
        id: 'verified-user',
        email: 'verified@example.com',
        name: 'Verified User',
        email_verified: true
      };

      const unverifiedUser: IUserData = {
        id: 'unverified-user',
        email: 'unverified@example.com',
        name: 'Unverified User',
        email_verified: false
      };

      expect(verifiedUser.email_verified).toBe(true);
      expect(unverifiedUser.email_verified).toBe(false);
      expect(typeof verifiedUser.email_verified).toBe('boolean');
      expect(typeof unverifiedUser.email_verified).toBe('boolean');
    });

    it('should maintain data integrity across different instances', () => {
      const userData1: IUserData = {
        id: 'user-1',
        email: 'user1@example.com',
        name: 'User One',
        email_verified: true,
        phone: '+1111111111'
      };

      const userData2: IUserData = {
        id: 'user-2',
        email: 'user2@example.com',
        name: 'User Two',
        email_verified: false,
        phone: '+2222222222'
      };

      expect(userData1.id).not.toBe(userData2.id);
      expect(userData1.email).not.toBe(userData2.email);
      expect(userData1.name).not.toBe(userData2.name);
      expect(userData1.email_verified).not.toBe(userData2.email_verified);
      expect(userData1.phone).not.toBe(userData2.phone);
    });

    it('should support string type for all text fields', () => {
      const userData: IUserData = {
        id: 'string-test',
        email: 'string@test.com',
        name: 'String Test User',
        email_verified: true,
        phone: '+0000000000'
      };

      expect(typeof userData.id).toBe('string');
      expect(typeof userData.email).toBe('string');
      expect(typeof userData.name).toBe('string');
      expect(typeof userData.phone).toBe('string');
      expect(userData.id.length).toBeGreaterThan(0);
      expect(userData.email.length).toBeGreaterThan(0);
      expect(userData.name.length).toBeGreaterThan(0);
    });

    it('should work with minimal required data', () => {
      const minimalUserData: IUserData = {
        id: 'min',
        email: 'min@test.com',
        name: 'Min',
        email_verified: false
      };

      expect(minimalUserData.id).toBe('min');
      expect(minimalUserData.email).toBe('min@test.com');
      expect(minimalUserData.name).toBe('Min');
      expect(minimalUserData.email_verified).toBe(false);
      expect(minimalUserData.phone).toBeUndefined();
    });
  });
});