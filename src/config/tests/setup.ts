// Global configuration for tests
import "dotenv/config";
import { jest } from "@jest/globals";

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
