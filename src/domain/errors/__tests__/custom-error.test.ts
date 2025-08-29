import { CustomError } from '../custom-error';

// Implementación concreta de CustomError para testing
class TestCustomError extends CustomError {
  constructor(message: string, field?: string, code?: string) {
    super(message, field, code);
  }

  getStatusCode(): number {
    return 500;
  }
}

describe('CustomError', () => {
  describe('constructor', () => {
    it('should create an error with message only', () => {
      const message = 'Test error message';
      const error = new TestCustomError(message);

      expect(error.message).toBe(message);
      expect(error.field).toBeUndefined();
      expect(error.code).toBeUndefined();
      expect(error.name).toBe('TestCustomError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(CustomError);
    });

    it('should create an error with message and field', () => {
      const message = 'Test error message';
      const field = 'email';
      const error = new TestCustomError(message, field);

      expect(error.message).toBe(message);
      expect(error.field).toBe(field);
      expect(error.code).toBeUndefined();
      expect(error.name).toBe('TestCustomError');
    });

    it('should create an error with message, field, and code', () => {
      const message = 'Test error message';
      const field = 'email';
      const code = 'INVALID_EMAIL';
      const error = new TestCustomError(message, field, code);

      expect(error.message).toBe(message);
      expect(error.field).toBe(field);
      expect(error.code).toBe(code);
      expect(error.name).toBe('TestCustomError');
    });

    it('should set the correct prototype', () => {
      const error = new TestCustomError('Test message');
      
      expect(Object.getPrototypeOf(error)).toBe(TestCustomError.prototype);
      expect(error instanceof TestCustomError).toBe(true);
      expect(error instanceof CustomError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('serializeErrors', () => {
    it('should serialize error with message only', () => {
      const message = 'Test error message';
      const error = new TestCustomError(message);
      const serialized = error.serializeErrors();

      expect(serialized).toEqual([
        {
          message,
          field: undefined,
          code: undefined
        }
      ]);
    });

    it('should serialize error with message and field', () => {
      const message = 'Test error message';
      const field = 'email';
      const error = new TestCustomError(message, field);
      const serialized = error.serializeErrors();

      expect(serialized).toEqual([
        {
          message,
          field,
          code: undefined
        }
      ]);
    });

    it('should serialize error with message, field, and code', () => {
      const message = 'Test error message';
      const field = 'email';
      const code = 'INVALID_EMAIL';
      const error = new TestCustomError(message, field, code);
      const serialized = error.serializeErrors();

      expect(serialized).toEqual([
        {
          message,
          field,
          code
        }
      ]);
    });

    it('should return an array with a single error object', () => {
      const error = new TestCustomError('Test message');
      const serialized = error.serializeErrors();

      expect(Array.isArray(serialized)).toBe(true);
      expect(serialized).toHaveLength(1);
    });
  });

  describe('getStatusCode', () => {
    it('should call the abstract getStatusCode method', () => {
      const error = new TestCustomError('Test message');
      const statusCode = error.getStatusCode();

      expect(statusCode).toBe(500);
      expect(typeof statusCode).toBe('number');
    });
  });

  describe('inheritance', () => {
    it('should be an instance of Error', () => {
      const error = new TestCustomError('Test message');
      
      expect(error instanceof Error).toBe(true);
    });

    it('should maintain proper stack trace', () => {
      const error = new TestCustomError('Test message');
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('TestCustomError');
    });
  });
});