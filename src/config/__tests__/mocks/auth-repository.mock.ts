import { LoginDto } from "@/domain/auth/dtos/login.dto";
import { LogoutDto } from "@/domain/auth/dtos/logout.dto";
import { RegisterDto } from "@/domain/auth/dtos/register.dto";
import { RequestResetPasswordEmailDto } from "@/domain/auth/dtos/request-reset-password-email.dto";
import { UpdateUserDto } from "@/domain/user/dtos/update-user.dto";
import { AuthUserEntity } from "@/domain/entities/auth-user.entity";
import { UserEntity } from "@/domain/entities/user.entity";
import { AuthRepository } from "@/domain/auth/repositories/auth.repository";

/**
 * Mock implementation of AuthRepository for testing purposes.
 * Provides configurable behavior for testing different scenarios.
 */
export class MockAuthRepository extends AuthRepository {
  private shouldFail: boolean = false;
  private mockResult: AuthUserEntity | null = null;
  private errorMessage: string = "Repository operation failed";

  /**
   * Configure the mock to fail on the next operation
   * @param shouldFail - Whether the next operation should fail
   * @param errorMessage - Custom error message (optional)
   */
  setShouldFail(shouldFail: boolean, errorMessage?: string): void {
    this.shouldFail = shouldFail;
    if (errorMessage) {
      this.errorMessage = errorMessage;
    }
  }

  /**
   * Set a custom result to be returned by operations
   * @param result - The AuthUserEntity to return
   */
  setMockResult(result: AuthUserEntity): void {
    this.mockResult = result;
  }

  /**
   * Reset the mock to its default state
   */
  reset(): void {
    this.shouldFail = false;
    this.mockResult = null;
    this.errorMessage = "Repository operation failed";
  }

  /**
   * Create a default mock AuthUserEntity for testing
   * @param email - User email
   * @param name - User name (optional)
   * @returns AuthUserEntity instance
   */
  createMockAuthUser(
    email: string,
    name: string = "Test User",
  ): AuthUserEntity {
    const mockUser = new UserEntity("user-123", email, name, true, undefined);

    const mockAuthData = {
      user: mockUser,
      data: {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
      },
    };

    return AuthUserEntity.createFrom(mockAuthData);
  }

  async register(registerDto: RegisterDto): Promise<AuthUserEntity> {
    if (this.shouldFail) {
      throw new Error(this.errorMessage);
    }

    if (this.mockResult) {
      return this.mockResult;
    }

    // Create a default mock result for register
    const fullName = `${registerDto.name} ${registerDto.lastname}`;
    return this.createMockAuthUser(registerDto.email, fullName);
  }

  async login(loginDto: LoginDto): Promise<AuthUserEntity> {
    if (this.shouldFail) {
      throw new Error(this.errorMessage);
    }

    if (this.mockResult) {
      return this.mockResult;
    }

    // Create a default mock result for login
    return this.createMockAuthUser(loginDto.email);
  }

  async logout(dto: LogoutDto): Promise<void> {
    if (!dto) {
      throw new Error("Invalid logout data: missing tokens");
    }

    if (this.shouldFail) {
      throw new Error(this.errorMessage);
    }
  }

  async updateUser(dto: UpdateUserDto): Promise<UserEntity | AuthUserEntity> {
    if (this.shouldFail) {
      throw new Error(this.errorMessage);
    }

    if (this.mockResult) {
      return this.mockResult;
    }

    // Create a default mock result for updateUser
    // Return a UserEntity with updated information
    const mockUser = new UserEntity(
      "user-123",
      dto.email || "test@example.com",
      "Updated User",
      true,
      dto.phone,
    );

    return mockUser;
  }

  async updateUserPassword(dto: UpdateUserDto): Promise<AuthUserEntity> {
    if (this.shouldFail) {
      throw new Error(this.errorMessage);
    }

    if (this.mockResult) {
      return this.mockResult;
    }

    // Create a default mock result for updateUserPassword
    // Return an AuthUserEntity with updated password
    return this.createMockAuthUser(
      dto.email || "test@example.com",
      "Updated User",
    );
  }

  async requestResetPasswordEmail(
    dto: RequestResetPasswordEmailDto,
  ): Promise<void> {
    if (this.shouldFail) {
      throw new Error(this.errorMessage);
    }

    // Mock implementation for testing - validate email exists
    if (!dto.email) {
      throw new Error("Email is required");
    }

    return Promise.resolve();
  }
}
