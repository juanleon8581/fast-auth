/**
 * Mock implementation of jose library for Jest tests
 * This mock provides the necessary functions used in the application
 */

// Simple mock functions that work in Jest environment
export const jwtVerify = async () => ({
  payload: {
    sub: "test-user-id",
    email: "test@example.com",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  },
  protectedHeader: {
    alg: "HS256",
    typ: "JWT",
  },
});

export class SignJWT {
  setProtectedHeader() { return this; }
  setIssuedAt() { return this; }
  setExpirationTime() { return this; }
  async sign() { return "mocked-jwt-token"; }
}

export const importJWK = async () => ({
  type: "secret",
  extractable: false,
});

export const importSPKI = async () => ({
  type: "public",
  extractable: false,
});

export const importPKCS8 = async () => ({
  type: "private",
  extractable: false,
});