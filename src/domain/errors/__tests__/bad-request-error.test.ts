import { BadRequestError } from '../bad-request-error';
import { CustomError } from '../custom-error';

describe('BadRequestError', () => {
  describe('constructor', () => {
    it('should create a BadRequestError with message only', () => {
      const message = 'Bad request error';
      const error = new BadRequestError(message);

      expect(error.message).toBe(message);
      expect(error.field).toBeUndefined();
      expect(error.code).toBeUndefined();
      expect(error.name).toBe('BadRequestError');
    });

    it('should create a BadRequestError with message and field', () => {
      const message = 'Invalid email format';
      const field = 'email';
      const error = new BadRequestError(message, field);

      expect(error.message).toBe(message);
      expect(error.field).toBe(field);
      expect(error.code).toBeUndefined();
      expect(error.name).toBe('BadRequestError');
    });

    it('should create a BadRequestError with message, field, and code', () => {
      const message = 'Invalid email format';
      const field = 'email';
      const code = 'INVALID_EMAIL';
      const error = new BadRequestError(message, field, code);

      expect(error.message).toBe(message);
      expect(error.field).toBe(field);
      expect(error.code).toBe(code);
      expect(error.name).toBe('BadRequestError');
    });
  });

  describe('getStatusCode', () => {
    it('should return 400 status code', () => {
      const error = new BadRequestError('Bad request');
      
      expect(error.getStatusCode()).toBe(400);
    });
  });

  describe('inheritance', () => {
    it('should be an instance of CustomError', () => {
      const error = new BadRequestError('Bad request');
      
      expect(error).toBeInstanceOf(CustomError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should inherit serializeErrors method', () => {
      const message = 'Invalid data';
      const field = 'username';
      const code = 'INVALID_USERNAME';
      const error = new BadRequestError(message, field, code);
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
      const error = new BadRequestError('Bad request');
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('BadRequestError');
    });

    it('should be throwable', () => {
      const message = 'Test bad request';
      
      expect(() => {
        throw new BadRequestError(message);
      }).toThrow(BadRequestError);
      
      expect(() => {
        throw new BadRequestError(message);
      }).toThrow(message);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle validation errors', () => {
      const error = new BadRequestError(
        'Email is required',
        'email',
        'REQUIRED_FIELD'
      );

      expect(error.getStatusCode()).toBe(400);
      expect(error.serializeErrors()).toEqual([
        {
          message: 'Email is required',
          field: 'email',
          code: 'REQUIRED_FIELD'
        }
      ]);
    });

    it('should handle malformed request errors', () => {
      const error = new BadRequestError(
        'Invalid JSON format',
        undefined,
        'MALFORMED_REQUEST'
      );

      expect(error.getStatusCode()).toBe(400);
      expect(error.serializeErrors()).toEqual([
        {
          message: 'Invalid JSON format',
          field: undefined,
          code: 'MALFORMED_REQUEST'
        }
      ]);
    });
  });
});