import { LoginDto } from "@/domain/dtos/login.dto";
import { RegisterDto } from "@/domain/dtos/register.dto";
import { AuthUserEntity } from "@/domain/entities/auth-user.entity";
import { UserEntity } from "@/domain/entities/user.entity";
import { AuthRepository } from "@/domain/repositories/auth.repository";

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
}
