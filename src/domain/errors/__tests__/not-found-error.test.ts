import { NotFoundError } from '../not-found-error';
import { CustomError } from '../custom-error';

describe('NotFoundError', () => {
  describe('constructor', () => {
    it('should create a NotFoundError with message only', () => {
      const message = 'Resource not found';
      const error = new NotFoundError(message);

      expect(error.message).toBe(message);
      expect(error.field).toBeUndefined();
      expect(error.code).toBeUndefined();
      expect(error.name).toBe('NotFoundError');
    });

    it('should create a NotFoundError with message and field', () => {
      const message = 'User not found';
      const field = 'userId';
      const error = new NotFoundError(message, field);

      expect(error.message).toBe(message);
      expect(error.field).toBe(field);
      expect(error.code).toBeUndefined();
      expect(error.name).toBe('NotFoundError');
    });

    it('should create a NotFoundError with message, field, and code', () => {
      const message = 'User not found';
      const field = 'userId';
      const code = 'USER_NOT_FOUND';
      const error = new NotFoundError(message, field, code);

      expect(error.message).toBe(message);
      expect(error.field).toBe(field);
      expect(error.code).toBe(code);
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('getStatusCode', () => {
    it('should return 404 status code', () => {
      const error = new NotFoundError('Not found');
      
      expect(error.getStatusCode()).toBe(404);
    });
  });

  describe('inheritance', () => {
    it('should be an instance of CustomError', () => {
      const error = new NotFoundError('Not found');
      
      expect(error).toBeInstanceOf(CustomError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should inherit serializeErrors method', () => {
      const message = 'Resource not found';
      const field = 'resourceId';
      const code = 'RESOURCE_NOT_FOUND';
      const error = new NotFoundError(message, field, code);
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
      const error = new NotFoundError('Not found');
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('NotFoundError');
    });

    it('should be throwable', () => {
      const message = 'Test not found';
      
      expect(() => {
        throw new NotFoundError(message);
      }).toThrow(NotFoundError);
      
      expect(() => {
        throw new NotFoundError(message);
      }).toThrow(message);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle user not found errors', () => {
      const error = new NotFoundError(
        'User with ID 123 not found',
        'userId',
        'USER_NOT_FOUND'
      );

      expect(error.getStatusCode()).toBe(404);
      expect(error.serializeErrors()).toEqual([
        {
          message: 'User with ID 123 not found',
          field: 'userId',
          code: 'USER_NOT_FOUND'
        }
      ]);
    });

    it('should handle route not found errors', () => {
      const error = new NotFoundError(
        'Route not found',
        undefined,
        'ROUTE_NOT_FOUND'
      );

      expect(error.getStatusCode()).toBe(404);
      expect(error.serializeErrors()).toEqual([
        {
          message: 'Route not found',
          field: undefined,
          code: 'ROUTE_NOT_FOUND'
        }
      ]);
    });

    it('should handle resource not found errors', () => {
      const error = new NotFoundError(
        'The requested resource does not exist'
      );

      expect(error.getStatusCode()).toBe(404);
      expect(error.serializeErrors()).toEqual([
        {
          message: 'The requested resource does not exist',
          field: undefined,
          code: undefined
        }
      ]);
    });
  });
});