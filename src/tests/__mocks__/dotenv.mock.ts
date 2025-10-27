import { jest } from "@jest/globals";

export const dotenvMock = jest.mock("dotenv", () => ({
  config: jest.fn(),
}));
