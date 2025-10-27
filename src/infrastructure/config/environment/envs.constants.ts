export const ERROR_MESSAGES = {
  URLS: "Must be a valid URL",
  NODE_ENV: {
    INVALID_VALUE:
      "NODE_ENV must be one of the following: dev, prod, qa, development, production",
  },
  PORT: {
    INVALID_VALUE: "PORT must be a number",
  },

  SUPABASE_ANON_KEY: {
    REQUIRED: "SUPABASE_ANON_KEY is required",
    NON_EMPTY: "SUPABASE_ANON_KEY must be non-empty",
  },
  JWT_SECRET: {
    REQUIRED: "JWT_SECRET is required",
    MIN_LENGTH: "JWT_SECRET must be at least 32 characters long",
  },
  PASSPHASE: {
    REQUIRED: "PASSPHASE is required",
    MIN_LENGTH: "PASSPHRASE must be at least 12 characters long",
  },
  LOG_TRANSPORT: {
    INVALID_VALUE:
      "LOG_TRANSPORT must be one of the following: console, file, all",
  },
  LOG_LEVEL: {
    INVALID_VALUE:
      "LOG_LEVEL must be one of the following: error, warn, info, http, verbose, debug, silly",
  },
  CRYPTO_ENVIRONMENT: {
    INVALID_VALUE:
      'CRYPTO_ENVIRONMENT must be one or more of the following: prod, qa, dev eg: ("dev,qa")',
  },
  CRYPTO_FORCE_ENCRYPT: {
    INVALID_VALUE: "CRYPTO_FORCE_ENCRYPT must be a boolean",
  },
  CRYPTO_DISABLED_ENCRYPT: {
    INVALID_VALUE: "CRYPTO_DISABLED_ENCRYPT must be a boolean",
  },
};
