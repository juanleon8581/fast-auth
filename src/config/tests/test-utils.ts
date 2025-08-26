import request from 'supertest';
import { Express } from 'express';

// Helper to create test requests
export const createTestRequest = (app: Express) => {
  return request(app);
};

// Common mock data for tests
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Helper to generate mock tokens
export const generateMockToken = (payload: any = {}) => {
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    user: { ...mockUser, ...payload }
  };
};

// Helper to clear all mocks after each test
export const clearAllMocks = () => {
  jest.clearAllMocks();
};

// Helper to wait for a specific amount of time
export const wait = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};