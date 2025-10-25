import { jest } from "@jest/globals";
// Reusable manual mock for LoggerService
// This mock makes the default export a constructor (jest.fn) returning an object with a .logger API

const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

const LoggerServiceMock = jest.fn(() => ({
  logger: mockLogger,
}));

export default LoggerServiceMock;

// Optional helpers for tests
export const getLoggerServiceMock = () =>
  LoggerServiceMock as unknown as jest.Mock;
export const getMockLogger = () => mockLogger;
export const resetLoggerServiceMock = () => {
  getLoggerServiceMock().mockClear();
  Object.values(mockLogger).forEach((fn) => (fn as jest.Mock).mockReset());
};
