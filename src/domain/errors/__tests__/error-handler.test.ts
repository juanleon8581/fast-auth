import { ErrorHandler } from '../error-handler';
import { CustomError } from '../custom-error';
import { BadRequestError } from '../bad-request-error';
import { NotFoundError } from '../not-found-error';
import { UnauthorizedError } from '../unauthorized-error';
import { ValidationError } from '../validation-error';

// Implementación concreta de CustomError para testing
class TestCustomError extends CustomError {
  constructor(message: string, field?: string, code?: string) {
    super(message, field, code);
  }

  getStatusCode(): number {
    return 418; // I'm a teapot
  }
}

describe('ErrorHandler', () => {
  describe('handle method', () => {
    describe('CustomError instances', () => {
      it('should handle BadRequestError correctly', () => {
        const error = new BadRequestError(
          'Invalid request data',
          'email',
          'INVALID_EMAIL'
        );
        const result = ErrorHandler.handle(error, 'test-request-id', '1.0.0');

        expect(result).toEqual({
          status: 'error',
          code: 400,
          errors: [
            {
              message: 'Invalid request data',
              field: 'email',
              code: 'INVALID_EMAIL'
            }
          ],
          meta: {
            requestId: 'test-request-id',
            timestamp: expect.any(String),
            version: '1.0.0'
          }
        });
      });

      it('should handle NotFoundError correctly', () => {
        const error = new NotFoundError(
          'User not found',
          'userId',
          'USER_NOT_FOUND'
        );
        const result = ErrorHandler.handle(error, 'test-request-id', '1.0.0');

        expect(result).toEqual({
          status: 'error',
          code: 404,
          errors: [
            {
              message: 'User not found',
              field: 'userId',
              code: 'USER_NOT_FOUND'
            }
          ],
          meta: {
            requestId: 'test-request-id',
            timestamp: expect.any(String),
            version: '1.0.0'
          }
        });
      });

      it('should handle UnauthorizedError correctly', () => {
        const error = new UnauthorizedError(
          'Access denied',
          'token',
          'INVALID_TOKEN'
        );
        const result = ErrorHandler.handle(error, 'test-request-id', '1.0.0');

        expect(result).toEqual({
          status: 'error',
          code: 401,
          errors: [
            {
              message: 'Access denied',
              field: 'token',
              code: 'INVALID_TOKEN'
            }
          ],
          meta: {
            requestId: 'test-request-id',
            timestamp: expect.any(String),
            version: '1.0.0'
          }
        });
      });

      it('should handle ValidationError correctly', () => {
        const error = new ValidationError(
          'Password is required',
          'password',
          'REQUIRED_FIELD'
        );
        const result = ErrorHandler.handle(error, 'test-request-id', '1.0.0');

        expect(result).toEqual({
          status: 'error',
          code: 422,
          errors: [
            {
              message: 'Password is required',
              field: 'password',
              code: 'REQUIRED_FIELD'
            }
          ],
          meta: {
            requestId: 'test-request-id',
            timestamp: expect.any(String),
            version: '1.0.0'
          }
        });
      });

      it('should handle custom CustomError implementation', () => {
        const error = new TestCustomError(
          'Custom error message',
          'customField',
          'CUSTOM_CODE'
        );
        const result = ErrorHandler.handle(error, 'test-request-id', '1.0.0');

        expect(result).toEqual({
          status: 'error',
          code: 418,
          errors: [
            {
              message: 'Custom error message',
              field: 'customField',
              code: 'CUSTOM_CODE'
            }
          ],
          meta: {
            requestId: 'test-request-id',
            timestamp: expect.any(String),
            version: '1.0.0'
          }
        });
      });

      it('should handle CustomError with minimal data', () => {
        const error = new BadRequestError('Simple error');
        const result = ErrorHandler.handle(error, 'test-request-id', '1.0.0');

        expect(result).toEqual({
          status: 'error',
          code: 400,
          errors: [
            {
              message: 'Simple error',
              field: undefined,
              code: undefined
            }
          ],
          meta: {
            requestId: 'test-request-id',
            timestamp: expect.any(String),
            version: '1.0.0'
          }
        });
      });
    });

    describe('Non-CustomError instances', () => {
      it('should handle standard Error instances', () => {
        const error = new Error('Standard error message');
        const result = ErrorHandler.handle(error, 'test-request-id', '1.0.0');

        expect(result).toEqual({
          status: 'error',
          code: 500,
          errors: [
            {
              message: 'Internal Server Error'
            }
          ],
          meta: {
            requestId: 'test-request-id',
            timestamp: expect.any(String),
            version: '1.0.0'
          }
        });
      });

      it('should handle string errors', () => {
        const error = 'String error message';
        const result = ErrorHandler.handle(error, 'test-request-id', '1.0.0');

        expect(result).toEqual({
          status: 'error',
          code: 500,
          errors: [
            {
              message: 'Internal Server Error'
            }
          ],
          meta: {
            requestId: 'test-request-id',
            timestamp: expect.any(String),
            version: '1.0.0'
          }
        });
      });

      it('should handle null errors', () => {
        const error = null;
        const result = ErrorHandler.handle(error, 'test-request-id', '1.0.0');

        expect(result).toEqual({
          status: 'error',
          code: 500,
          errors: [
            {
              message: 'Internal Server Error'
            }
          ],
          meta: {
            requestId: 'test-request-id',
            timestamp: expect.any(String),
            version: '1.0.0'
          }
        });
      });

      it('should handle undefined errors', () => {
        const error = undefined;
        const result = ErrorHandler.handle(error, 'test-request-id', '1.0.0');

        expect(result).toEqual({
          status: 'error',
          code: 500,
          errors: [
            {
              message: 'Internal Server Error'
            }
          ],
          meta: {
            requestId: 'test-request-id',
            timestamp: expect.any(String),
            version: '1.0.0'
          }
        });
      });

      it('should handle object errors', () => {
        const error = { message: 'Object error', code: 'OBJECT_ERROR' };
        const result = ErrorHandler.handle(error, 'test-request-id', '1.0.0');

        expect(result).toEqual({
          status: 'error',
          code: 500,
          errors: [
            {
              message: 'Internal Server Error'
            }
          ],
          meta: {
            requestId: 'test-request-id',
            timestamp: expect.any(String),
            version: '1.0.0'
          }
        });
      });

      it('should handle number errors', () => {
        const error = 404;
        const result = ErrorHandler.handle(error, 'test-request-id', '1.0.0');

        expect(result).toEqual({
          status: 'error',
          code: 500,
          errors: [
            {
              message: 'Internal Server Error'
            }
          ],
          meta: {
            requestId: 'test-request-id',
            timestamp: expect.any(String),
            version: '1.0.0'
          }
        });
      });
    });

    describe('return value structure', () => {
      it('should always return an object with correct structure', () => {
        const error = new BadRequestError('Test error');
        const result = ErrorHandler.handle(error);

        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('code');
        expect(result).toHaveProperty('errors');
        expect(result.status).toBe('error');
        expect(typeof result.code).toBe('number');
        expect(Array.isArray(result.errors)).toBe(true);
      });

      it('should always return errors as an array', () => {
        const customError = new ValidationError('Validation failed');
        const unknownError = new Error('Unknown error');

        const customResult = ErrorHandler.handle(customError);
        const unknownResult = ErrorHandler.handle(unknownError);

        expect(Array.isArray(customResult.errors)).toBe(true);
        expect(Array.isArray(unknownResult.errors)).toBe(true);
        expect(customResult.errors).toHaveLength(1);
        expect(unknownResult.errors).toHaveLength(1);
      });
    });
  });

  describe('static method', () => {
    it('should be a static method', () => {
      expect(typeof ErrorHandler.handle).toBe('function');
      expect(ErrorHandler.handle).toBe(ErrorHandler.handle);
    });

    it('should not require instantiation', () => {
      const error = new BadRequestError('Test');
      
      // Should work without creating an instance
      expect(() => ErrorHandler.handle(error)).not.toThrow();
      
      const result = ErrorHandler.handle(error);
      expect(result).toBeDefined();
    });
  });
});