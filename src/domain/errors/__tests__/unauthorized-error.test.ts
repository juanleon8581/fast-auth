import { UnauthorizedError } from '../unauthorized-error';
import { CustomError } from '../custom-error';

describe('UnauthorizedError', () => {
  describe('constructor', () => {
    it('should create an UnauthorizedError with message only', () => {
      const message = 'Unauthorized access';
      const error = new UnauthorizedError(message);

      expect(error.message).toBe(message);
      expect(error.field).toBeUndefined();
      expect(error.code).toBeUndefined();
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should create an UnauthorizedError with message and field', () => {
      const message = 'Invalid token';
      const field = 'authorization';
      const error = new UnauthorizedError(message, field);

      expect(error.message).toBe(message);
      expect(error.field).toBe(field);
      expect(error.code).toBeUndefined();
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should create an UnauthorizedError with message, field, and code', () => {
      const message = 'Token has expired';
      const field = 'token';
      const code = 'TOKEN_EXPIRED';
      const error = new UnauthorizedError(message, field, code);

      expect(error.message).toBe(message);
      expect(error.field).toBe(field);
      expect(error.code).toBe(code);
      expect(error.name).toBe('UnauthorizedError');
    });
  });

  describe('getStatusCode', () => {
    it('should return 401 status code', () => {
      const error = new UnauthorizedError('Unauthorized');
      
      expect(error.getStatusCode()).toBe(401);
    });
  });

  describe('inheritance', () => {
    it('should be an instance of CustomError', () => {
      const error = new UnauthorizedError('Unauthorized');
      
      expect(error).toBeInstanceOf(CustomError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should inherit serializeErrors method', () => {
      const message = 'Access denied';
      const field = 'permissions';
      const code = 'ACCESS_DENIED';
      const error = new UnauthorizedError(message, field, code);
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
      const error = new UnauthorizedError('Unauthorized');
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('UnauthorizedError');
    });

    it('should be throwable', () => {
      const message = 'Test unauthorized';
      
      expect(() => {
        throw new UnauthorizedError(message);
      }).toThrow(UnauthorizedError);
      
      expect(() => {
        throw new UnauthorizedError(message);
      }).toThrow(message);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle missing token errors', () => {
      const error = new UnauthorizedError(
        'Authorization token is required',
        'authorization',
        'MISSING_TOKEN'
      );

      expect(error.getStatusCode()).toBe(401);
      expect(error.serializeErrors()).toEqual([
        {
          message: 'Authorization token is required',
          field: 'authorization',
          code: 'MISSING_TOKEN'
        }
      ]);
    });

    it('should handle invalid token errors', () => {
      const error = new UnauthorizedError(
        'Invalid or malformed token',
        'token',
        'INVALID_TOKEN'
      );

      expect(error.getStatusCode()).toBe(401);
      expect(error.serializeErrors()).toEqual([
        {
          message: 'Invalid or malformed token',
          field: 'token',
          code: 'INVALID_TOKEN'
        }
      ]);
    });

    it('should handle expired token errors', () => {
      const error = new UnauthorizedError(
        'Token has expired',
        'token',
        'TOKEN_EXPIRED'
      );

      expect(error.getStatusCode()).toBe(401);
      expect(error.serializeErrors()).toEqual([
        {
          message: 'Token has expired',
          field: 'token',
          code: 'TOKEN_EXPIRED'
        }
      ]);
    });

    it('should handle insufficient permissions errors', () => {
      const error = new UnauthorizedError(
        'Insufficient permissions to access this resource'
      );

      expect(error.getStatusCode()).toBe(401);
      expect(error.serializeErrors()).toEqual([
        {
          message: 'Insufficient permissions to access this resource',
          field: undefined,
          code: undefined
        }
      ]);
    });
  });
});