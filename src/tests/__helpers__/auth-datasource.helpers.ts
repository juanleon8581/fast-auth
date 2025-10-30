import { RegisterDto } from "@/domain/auth/dtos/register.dto";
import { LoginDto } from "@/domain/auth/dtos/login.dto";
import { LogoutDto } from "@/domain/auth/dtos/logout.dto";
import { UpdateUserDto } from "@/domain/user/dtos/update-user.dto";
import { UserEntity } from "@/domain/user/entities/user.entity";
import { AuthUserEntity } from "@/domain/auth/entities/auth-user.entity";

// Mock types will be defined in individual test files

// Mock data factories
export const createMockRegisterDto = (): RegisterDto =>
  ({
    name: "John",
    lastname: "Doe",
    email: "john.doe@example.com",
    password: "SecurePass123!",
    role: "USER",
  }) as RegisterDto;

export const createMockLoginDto = (): LoginDto =>
  ({
    email: "john.doe@example.com",
    password: "SecurePass123!",
  }) as LoginDto;

export const createMockUpdateUserDto = (): UpdateUserDto =>
  ({
    sessionToken: "session-token-123",
    refreshToken: "refresh-token-123",
    email: "john.doe@example.com",
    newPassword: "NewSecurePass123!",
    phone: "+1234567890",
    role: "USER",
  }) as UpdateUserDto;

export const createMockLogoutDto = (): LogoutDto =>
  ({
    sessionToken: "session-token-123",
    refreshToken: "refresh-token-123",
  }) as LogoutDto;

export const createMockUser = () => ({
  id: "user-123",
  email: "john.doe@example.com",
  user_metadata: {
    display_name: "John Doe",
  },
  email_confirmed_at: "2024-01-01T00:00:00Z",
  created_at: "2024-01-01T00:00:00Z",
});

export const createMockSession = () => ({
  access_token: "access-token-123",
  refresh_token: "refresh-token-123",
});

export const createMockDatasourceUserMapper = () => ({
  id: "user-123",
  email: "john.doe@example.com",
  name: "John Doe",
  email_verified: true,
  created_at: new Date(),
});

export const createMockUserEntity = (): UserEntity =>
  ({
    id: "user-123",
    email: "john.doe@example.com",
    name: "John Doe",
  }) as UserEntity;

export const createMockAuthUserEntity = (): AuthUserEntity =>
  ({
    user: createMockUserEntity(),
    accessToken: "access-token-123",
    refreshToken: "refresh-token-123",
  }) as AuthUserEntity;

// Test data variations
export const createMockUserWithoutSession = () => ({
  ...createMockUser(),
  user_metadata: { display_name: "John Doe" },
});

export const createMockSupabaseError = (
  message: string = "Supabase error",
) => ({
  message,
  code: "auth_error",
  status: 400,
});

// Common test scenarios data
export const TEST_SCENARIOS = {
  SUCCESSFUL_REGISTRATION: {
    user: createMockUser(),
    session: createMockSession(),
    datasourceUserDto: createMockDatasourceUserMapper(),
    userEntity: createMockUserEntity(),
    authUserEntity: createMockAuthUserEntity(),
  },
  REGISTRATION_WITHOUT_SESSION: {
    user: createMockUserWithoutSession(),
    session: null,
    datasourceUserDto: createMockDatasourceUserMapper(),
    userEntity: createMockUserEntity(),
  },
  SUCCESSFUL_LOGIN: {
    user: createMockUser(),
    session: createMockSession(),
    datasourceUserDto: createMockDatasourceUserMapper(),
    userEntity: createMockUserEntity(),
    authUserEntity: createMockAuthUserEntity(),
  },
  SUCCESSFUL_LOGOUT: {
    setSessionResponse: { error: null },
    signOutResponse: { error: null },
  },
};

// Error scenarios
export const ERROR_SCENARIOS = {
  SUPABASE_ERROR: createMockSupabaseError("User already registered"),
  USER_NOT_CREATED: createMockSupabaseError("User not created"),
  CLIENT_CREATION_ERROR: new Error("Failed to create Supabase client"),
  INVALID_USER_DATA: new Error("Invalid user data"),
  LOGIN_ERROR: createMockSupabaseError("Invalid credentials"),
  LOGOUT_ERROR: createMockSupabaseError("Failed to logout"),
};
