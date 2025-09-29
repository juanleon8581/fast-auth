import { Request, Response, NextFunction } from 'express';

// Mock jose module before importing
const mockJwtVerify = jest.fn();
jest.mock('jose', () => ({
  jwtVerify: mockJwtVerify
}));

// Mock the envs module
jest.mock('../../../config/envs', () => ({
  JWT_SECRET: 'test-secret-key-that-is-at-least-32-characters-long-for-testing'
}));

import { authMiddleware, optionalAuthMiddleware } from '../auth.middleware';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    it('should reject requests without Authorization header', async () => {
      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Authorization header is required',
        message: 'Please provide a valid Bearer token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid authorization format', async () => {
      mockRequest.headers!.authorization = 'Invalid token';

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid authorization format',
        message: 'Authorization header must start with "Bearer "'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject requests with empty Bearer token', async () => {
      mockRequest.headers!.authorization = 'Bearer ';

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Token is required',
        message: 'Bearer token cannot be empty'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid JWT token', async () => {
      mockRequest.headers!.authorization = 'Bearer invalid.jwt.token';
      mockJwtVerify.mockRejectedValue(new Error('Invalid token'));

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'The provided token is invalid or malformed'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept requests with valid JWT token', async () => {
      const mockPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'authenticated',
        aud: 'authenticated',
        iss: 'supabase',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      mockRequest.headers!.authorization = 'Bearer valid.jwt.token';
      mockJwtVerify.mockResolvedValue({ payload: mockPayload });

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject expired JWT tokens', async () => {
      mockRequest.headers!.authorization = 'Bearer expired.jwt.token';
      mockJwtVerify.mockRejectedValue(new Error('Token expired'));

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Token expired',
        message: 'The provided token has expired. Please refresh your token.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle JWT signature verification errors', async () => {
      mockRequest.headers!.authorization = 'Bearer invalid.signature.token';
      mockJwtVerify.mockRejectedValue(new Error('Invalid signature'));

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid token signature',
        message: 'The token signature is invalid'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuthMiddleware', () => {
    it('should continue without validation when no auth header is provided', async () => {
      await optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without validation when Authorization header is not Bearer', async () => {
      mockRequest.headers!.authorization = 'Basic dGVzdDp0ZXN0';

      await optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should validate token when auth header is provided', async () => {
      const mockPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'authenticated',
        aud: 'authenticated',
        iss: 'supabase',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      mockRequest.headers!.authorization = 'Bearer valid.jwt.token';
      mockJwtVerify.mockResolvedValue({ payload: mockPayload });

      await optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when invalid token is provided', async () => {
      mockRequest.headers!.authorization = 'Bearer invalid.jwt.token';
      mockJwtVerify.mockRejectedValue(new Error('Invalid token'));

      await optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid token',
        message: 'The provided token is invalid or malformed'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});