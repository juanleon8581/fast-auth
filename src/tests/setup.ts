// Global configuration for tests
import "dotenv/config";
import { jest } from "@jest/globals";
import mockEnv from "./__mocks__/env.mock";

// Timeout configuration
jest.setTimeout(10000);

jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

process.env = { ...mockEnv };

// Global console mock to avoid logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
