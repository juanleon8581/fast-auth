import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          target: "ES2020",
          module: "ESNext",
          moduleResolution: "node",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true,
          baseUrl: ".",
          paths: {
            "@/*": ["./src/*"],
          },
        },
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/app.ts",
    "!src/**/index.ts",
    "!src/config/tests/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/src/config/tests/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testTimeout: 10000,
};

export default config;
