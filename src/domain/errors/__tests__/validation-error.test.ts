import { ValidationError } from '../validation-error';
import { CustomError } from '../custom-error';

describe('ValidationError', () => {
  describe('constructor', () => {
    it('should create a ValidationError with message only', () => {
      const message = 'Validation failed';
      const error = new ValidationError(message);

      expect(error.message).toBe(message);
      expect(error.field).toBeUndefined();
      expect(error.code).toBeUndefined();
      expect(error.name).toBe('ValidationError');
    });

    it('should create a ValidationError with message and field', () => {
      const message = 'Email format is invalid';
      const field = 'email';
      const error = new ValidationError(message, field);

      expect(error.message).toBe(message);
      expect(error.field).toBe(field);
      expect(error.code).toBeUndefined();
      expect(error.name).toBe('ValidationError');
    });

    it('should create a ValidationError with message, field, and code', () => {
      const message = 'Password is too weak';
      const field = 'password';
      const code = 'WEAK_PASSWORD';
      const error = new ValidationError(message, field, code);

      expect(error.message).toBe(message);
      expect(error.field).toBe(field);
      expect(error.code).toBe(code);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('getStatusCode', () => {
    it('should return 422 status code', () => {
      const error = new ValidationError('Validation failed');
      
      expect(error.getStatusCode()).toBe(422);
    });
  });

  describe('inheritance', () => {
    it('should be an instance of CustomError', () => {
      const error = new ValidationError('Validation failed');
      
      expect(error).toBeInstanceOf(CustomError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should inherit serializeErrors method', () => {
      const message = 'Field is required';
      const field = 'username';
      const code = 'REQUIRED_FIELD';
      const error = new ValidationError(message, field, code);
      const serialized = error.serializeErrors();

      expect(serialized).toEqual([
        {
          message,
          field,
          code
        }
      ]);
    });
  });

  describe('error properties', () => {
    it('should maintain proper stack trace', () => {
      const error = new ValidationError('Validation failed');
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('ValidationError');
    });

    it('should be throwable', () => {
      const message = 'Test validation error';
      
      expect(() => {
        throw new ValidationError(message);
      }).toThrow(ValidationError);
      
      expect(() => {
        throw new ValidationError(message);
      }).toThrow(message);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle required field validation errors', () => {
      const error = new ValidationError(
        'Name is required',
        'name',
        'REQUIRED_FIELD'
      );

      expect(error.getStatusCode()).toBe(422);
      expect(error.serializeErrors()).toEqual([
        {
          message: 'Name is required',
          field: 'name',
          code: 'REQUIRED_FIELD'
        }
      ]);
    });

    it('should handle email format validation errors', () => {
      const error = new ValidationError(
        'Please provide a valid email address',
        'email',
        'INVALID_EMAIL_FORMAT'
      );

      expect(error.getStatusCode()).toBe(422);
      expect(error.serializeErrors()).toEqual([
        {
          message: 'Please provide a valid email address',
          field: 'email',
          code: 'INVALID_EMAIL_FORMAT'
        }
      ]);
    });

    it('should handle password strength validation errors', () => {
      const error = new ValidationError(
        'Password must be at least 8 characters long',
        'password',
        'PASSWORD_TOO_SHORT'
      );

      expect(error.getStatusCode()).toBe(422);
      expect(error.serializeErrors()).toEqual([
        {
          message: 'Password must be at least 8 characters long',
          field: 'password',
          code: 'PASSWORD_TOO_SHORT'
        }
      ]);
    });

    it('should handle general validation errors', () => {
      const error = new ValidationError(
        'The provided data is invalid'
      );

      expect(error.getStatusCode()).toBe(422);
      expect(error.serializeErrors()).toEqual([
        {
          message: 'The provided data is invalid',
          field: undefined,
          code: undefined
        }
      ]);
    });

    it('should handle numeric validation errors', () => {
      const error = new ValidationError(
        'Age must be a positive number',
        'age',
        'INVALID_NUMBER'
      );

      expect(error.getStatusCode()).toBe(422);
      expect(error.serializeErrors()).toEqual([
        {
          message: 'Age must be a positive number',
          field: 'age',
          code: 'INVALID_NUMBER'
        }
      ]);
    });
  });
});