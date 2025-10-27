export const ERROR_MESSAGES = {
  DATA_VALIDATION: {
    MISSING_FIELDS: "Required fields are missing",
    INVALID_FIELDS: "Invalid fields",
    UNKNOWN_VALIDATION_ERROR: "Unknown validation error",
    INVALID_DATA: "Invalid data",
    EMAIL_NOT_VERIFIED: "Email not verified",
    AUTHORIZATION_HEADER_REQUIRED: "Authorization header is required",
    INVALID_AUTHORIZATION_FORMAT: "Invalid authorization format",
    TOKEN_EXPIRED: "Token has expired",
  },
  AUTH: {
    REFRESH_SESSION: {
      SESSION_NOT_FOUND: "Session not found",
    },
    REGISTER: {
      USER_NO_CREATED: "User not created",
      VALIDATION: {
        NAME: {
          MIN_LENGTH: "Name must be at least 2 characters long",
          MAX_LENGTH: "Name cannot exceed 50 characters",
          INVALID_FORMAT: "Name can only contain letters and spaces",
        },
        LASTNAME: {
          MIN_LENGTH: "Last name must be at least 2 characters long",
          MAX_LENGTH: "Last name cannot exceed 50 characters",
          INVALID_FORMAT: "Last name can only contain letters and spaces",
        },
        EMAIL: {
          INVALID_FORMAT: "Must be a valid email",
          MAX_LENGTH: "Email cannot exceed 100 characters",
        },
        PASSWORD: {
          MIN_LENGTH: "Password must be at least 8 characters long",
          MAX_LENGTH: "Password cannot exceed 128 characters",
          INVALID_FORMAT:
            "Password must contain at least: 1 lowercase, 1 uppercase, 1 number and 1 special character",
        },
      },
    },
    LOGIN: {
      INVALID_DATA_RECEIVED: "Invalid data received",
      USER_NOT_FOUND: "User not found",
      INVALID_CREDENTIALS: "Invalid credentials",
      VALIDATION: {
        EMAIL: {
          REQUIRED: "Email is required",
          INVALID_FORMAT: "Must be a valid email",
          MAX_LENGTH: "Email cannot exceed 100 characters",
        },
        PASSWORD: {
          REQUIRED: "Password is required",
          MIN_LENGTH: "Password must be at least 1 character long",
        },
      },
    },
    LOGOUT: {
      USER_NOT_LOGGED_OUT: "User not logged out",
      VALIDATION: {
        ACCESS_TOKEN: {
          REQUIRED: "Access token is required",
        },
        REFRESH_TOKEN: {
          REQUIRED: "Refresh token is required",
        },
      },
    },
    UPDATE_USER: {
      USER_NOT_UPDATED: "User not updated",
      VALIDATION: {
        SESSION_TOKEN: {
          REQUIRED: "Session token is required",
          INVALID_FORMAT: "Session token must be a valid string",
        },
        REFRESH_TOKEN: {
          REQUIRED: "Refresh token is required",
          INVALID_FORMAT: "Refresh token must be a valid string",
        },
        EMAIL: {
          INVALID_FORMAT: "Must be a valid email",
          MAX_LENGTH: "Email cannot exceed 100 characters",
        },
        NEW_PASSWORD: {
          MIN_LENGTH: "New password must be at least 8 characters long",
          MAX_LENGTH: "New password cannot exceed 128 characters",
          INVALID_FORMAT:
            "New password must contain at least: 1 lowercase, 1 uppercase, 1 number and 1 special character",
        },
        NEW_PASSWORD_CONFIRMATION: {
          REQUIRED_WITH_PASSWORD:
            "Password confirmation is required when setting a new password",
          MUST_MATCH: "Password confirmation must match the new password",
        },
        PHONE: {
          INVALID_FORMAT: "Phone number must be in a valid format",
        },
        NAME_LASTNAME: {
          BOTH_REQUIRED: "Name and last name must be provided together",
        },
      },
    },
    REQUEST_RESET_PASSWORD_EMAIL: {
      EMAIL_NOT_SENT: "Reset password email not sent",
      VALIDATION: {
        EMAIL: {
          REQUIRED: "Email is required",
          INVALID_FORMAT: "Must be a valid email",
          MAX_LENGTH: "Email cannot exceed 100 characters",
        },
        REDIRECT_TO: {
          INVALID_FORMAT: "Redirect URL must be a valid URL",
          MAX_LENGTH: "Redirect URL cannot exceed 500 characters",
        },
      },
    },
  },
} as const;

export type TErrorMessages = typeof ERROR_MESSAGES;