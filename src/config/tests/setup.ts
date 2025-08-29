// Global configuration for tests
import "dotenv/config";
import { jest } from "@jest/globals";

// Mock environment variables for testing
process.env.NODE_ENV = "test";
process.env.PORT = "3001";
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

// Timeout configuration
jest.setTimeout(10000);

// Global console mock to avoid logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
