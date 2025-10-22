const mockEnv = {
  NODE_ENV: "dev",
  PORT: "3008",
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_ANON_KEY: "test-anon-key",
  JWT_SECRET: "jwt-test-secret-with-at-least-32-characters-long",
  DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  PASSPHRASE: "test-passphrase",
};

Object.freeze(mockEnv);

export default mockEnv;
