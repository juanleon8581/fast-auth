# Endpoint Development Guide

This guide provides a comprehensive template-based approach for creating new API endpoints in the Fast Auth project. Follow these templates to maintain consistency with the Clean Architecture pattern.

## Architecture Overview

Each endpoint follows this flow:

```
HTTP Request → Route → Controller → Validator → Use Case → Repository → Datasource → Database
                                                                                      ↓
HTTP Response ← Response Helper ← Controller ← Use Case ← Repository ← Datasource
```

## Step-by-Step Implementation Template

### 1. Create Entity (if needed)

**Location**: `src/domain/entities/[entity-name].entity.ts`

**Template**:

```typescript
// src/domain/entities/user.entity.ts
export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly email_verified: boolean,
    public readonly phone: string | null,
    public readonly created_at?: Date,
    public readonly updated_at?: Date,
  ) {}

  static createFrom(object: { [key: string]: any }): UserEntity {
    const { id, email, name, email_verified, phone, created_at, updated_at } = object;

    // Validation logic
    if (!id) throw new Error("ID is required");
    if (!email) throw new Error("Email is required");
    if (!name) throw new Error("Name is required");
    if (typeof email_verified !== "boolean") throw new Error("Email verified must be a boolean");

    return new UserEntity(
      id,
      email,
      name,
      email_verified,
      phone,
      created_at ? new Date(created_at) : undefined,
      updated_at ? new Date(updated_at) : undefined,
    );
  }

  // Business logic methods
  isEmailVerified(): boolean {
    return this.email_verified;
  }

  hasPhone(): boolean {
    return this.phone !== null;
  }
}
```

### 2. Create Custom Errors (if needed)

**Location**: `src/domain/errors/[error-name].error.ts`

**Template**:

```typescript
// src/domain/errors/user-not-found.error.ts
import { AppError } from "./app-error";

export class UserNotFoundError extends AppError {
  constructor(message: string = "User not found") {
    super(message, 404, "USER_NOT_FOUND");
  }
}
```

```typescript
// src/domain/errors/invalid-credentials.error.ts
import { AppError } from "./app-error";

export class InvalidCredentialsError extends AppError {
  constructor(message: string = "Invalid credentials provided") {
    super(message, 401, "INVALID_CREDENTIALS");
  }
}
```

### 3. Define the DTO (Data Transfer Object)

**Location**: `src/infrastructure/dtos/[feature]/[action].dto.ts`

**Template**:

```typescript
// src/infrastructure/dtos/auth/login.dto.ts
export class LoginDto {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}

  static createFrom(object: { [key: string]: any }): LoginDto {
    const { email, password } = object;

    // Validation logic
    if (!email) throw new Error("Email is required");
    if (!password) throw new Error("Password is required");
    if (typeof email !== "string") throw new Error("Email must be a string");
    if (typeof password !== "string")
      throw new Error("Password must be a string");

    return new LoginDto(email, password);
  }
}
```

### 4. Create Repository Contract

**Location**: `src/domain/repositories/[feature].repository.ts`

**Template**:

```typescript
// src/domain/repositories/auth.repository.ts
import { LoginDto } from "@/infrastructure/dtos/auth/login.dto";
import { AuthUserEntity } from "@/domain/entities/auth-user.entity";

export abstract class AuthRepository {
  abstract register(registerDto: RegisterDto): Promise<AuthUserEntity>;

  // Add new method
  abstract login(loginDto: LoginDto): Promise<AuthUserEntity>;
}
```

### 5. Implement Use Case

**Location**: `src/domain/use-cases/[feature]/[action]-[entity].ts`

**Template**:

```typescript
// src/domain/use-cases/auth/login-user.ts
import { LoginDto } from "@/infrastructure/dtos/auth/login.dto";
import { AuthUserEntity } from "@/domain/entities/auth-user.entity";
import { AuthRepository } from "@/domain/repositories/auth.repository";

export class LoginUser {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(loginDto: LoginDto): Promise<AuthUserEntity> {
    return await this.authRepository.login(loginDto);
  }
}
```

### 6. Create Validator

**Location**: `src/infrastructure/validators/[feature]/[action].validator.ts`

**Template**:

```typescript
// src/infrastructure/validators/auth/login.validator.ts
import { z } from "zod";
import { ValidationError } from "@/domain/errors/validation-error";

const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .max(100, "Email must be less than 100 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters"),
});

export class LoginValidator {
  static validate(data: unknown) {
    const result = loginSchema.safeParse(data);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      throw new ValidationError("Validation failed", errors);
    }

    return result.data;
  }
}
```

### 7. Implement Datasource

**Location**: `src/infrastructure/datasources/[feature].datasource.ts`

**Template**:

```typescript
// Update existing src/infrastructure/datasources/auth.datasource.ts
import { LoginDto } from "@/infrastructure/dtos/auth/login.dto";
import { InvalidCredentialsError } from "@/domain/errors/invalid-credentials.error";
import { UserNotFoundError } from "@/domain/errors/user-not-found.error";
import { BadRequestError } from "@/domain/errors/bad-request-error";

export class AuthDatasource extends AuthRepository {
  // ... existing register method ...

  async login(loginDto: LoginDto): Promise<AuthUserEntity> {
    try {
      // Implement authentication logic
      // This is a template - replace with actual implementation
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginDto.email,
        password: loginDto.password,
      });

      if (error) {
        // Use specific custom errors based on error type
        if (error.message.includes("Invalid login credentials")) {
          throw new InvalidCredentialsError();
        }
        if (error.message.includes("User not found")) {
          throw new UserNotFoundError();
        }
        throw new BadRequestError(error.message);
      }

      if (!data.user) {
        throw new InvalidCredentialsError();
      }

      // Create and return AuthUserEntity
      const userEntity = UserEntity.createFrom({
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || "",
        email_verified: data.user.email_confirmed_at !== null,
        phone: data.user.phone || null,
      });

      return AuthUserEntity.createFrom({
        user: userEntity,
        accessToken: data.session?.access_token || "",
        refreshToken: data.session?.refresh_token || "",
      });
    } catch (error) {
      // Re-throw custom errors
      if (error instanceof InvalidCredentialsError || 
          error instanceof UserNotFoundError || 
          error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError("Login failed");
    }
  }
}
```

### 8. Update Controller

**Location**: `src/presentation/controller/controller.ts`

**Template**:

```typescript
// Add to existing AuthController
import { LoginUser } from "@/domain/use-cases/auth/login-user";
import { LoginValidator } from "@/infrastructure/validators/auth/login.validator";
import { LoginDto } from "@/infrastructure/dtos/auth/login.dto";

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser, // Add new use case
  ) {}

  // ... existing register method ...

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validatedData = LoginValidator.validate(req.body);

      // Create DTO
      const loginDto = LoginDto.createFrom(validatedData);

      // Execute use case
      const result = await this.loginUser.execute(loginDto);

      // Send response
      ResponseHelper.success(res, result, req, 200);
    } catch (error) {
      next(error);
    }
  };
}
```

### 9. Update Routes

**Location**: `src/presentation/[feature]/routes/routes.ts`

**Template**:

```typescript
// Update existing src/presentation/auth/routes/routes.ts
export class AuthRoutes {
  static get routes(): Router {
    const router = Router();

    // Dependencies
    const authRepository = new AuthDatasource();
    const registerUser = new RegisterUser(authRepository);
    const loginUser = new LoginUser(authRepository); // Add new use case

    const authController = new AuthController(registerUser, loginUser);

    // Routes
    router.post("/register", authController.register);
    router.post("/login", authController.login); // Add new route

    return router;
  }
}
```

### 10. Create API Documentation

#### Path Documentation

**Location**: `docs/api/paths/[feature]/[action].path.yml`

**Template**:

```yaml
# docs/api/paths/auth/login.path.yml
paths:
  /api/auth/login:
    post:
      tags:
        - Auth
      summary: Login user
      description: Authenticate user and return access tokens
      operationId: loginUser
      requestBody:
        description: User login credentials
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/LoginUserRequest"
        required: true
      responses:
        "200":
          description: User authenticated successfully
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/LoginUserResponse"
        "400":
          description: Invalid credentials
        "422":
          description: Validation error
        "500":
          description: Internal server error
```

#### Request Schema

**Location**: `docs/api/schemas/[feature]/[action]-request.schema.yml`

**Template**:

```yaml
# docs/api/schemas/auth/login-request.schema.yml
components:
  schemas:
    LoginUserRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          description: User email
          example: joe.doe@example.com
          format: email
          maxLength: 100
        password:
          type: string
          description: User password
          minLength: 8
          maxLength: 128
          example: "SecurePass123"
          format: password
```

#### Response Schema

**Location**: `docs/api/schemas/[feature]/[action]-response.schema.yml`

**Template**:

```yaml
# docs/api/schemas/auth/login-response.schema.yml
components:
  schemas:
    LoginUserResponse:
      type: object
      properties:
        user:
          type: object
          $ref: "#/components/schemas/UserResponse"
        accessToken:
          type: string
          description: JWT access token
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          format: jwt
        refreshToken:
          type: string
          description: JWT refresh token
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          format: jwt
```

## Implementation Checklist

### Pre-Implementation

- [ ] Define the endpoint requirements
- [ ] Identify required data fields
- [ ] Determine response structure
- [ ] Plan error scenarios

### Implementation Phase

- [ ] Create entity (if new domain object needed)
- [ ] Create custom errors (if specific error handling needed)
- [ ] Create DTO with validation
- [ ] Update repository contract
- [ ] Implement use case
- [ ] Create validator with Zod schema
- [ ] Update datasource implementation
- [ ] Add controller method
- [ ] Update routes
- [ ] Create API documentation (path + schemas)

### Testing Phase

- [ ] Write unit tests for entity (if created)
- [ ] Write unit tests for custom errors (if created)
- [ ] Write unit tests for DTO
- [ ] Write unit tests for use case
- [ ] Write unit tests for validator
- [ ] Write integration tests for controller
- [ ] Write API tests for endpoint
- [ ] Test error scenarios

### Documentation Phase

- [ ] Update API documentation
- [ ] Test Swagger UI functionality
- [ ] Verify examples work correctly
- [ ] Update development documentation if needed

### Quality Assurance

- [ ] Run linting: `pnpm lint`
- [ ] Run tests: `pnpm test`
- [ ] Check TypeScript compilation: `pnpm build`
- [ ] Verify server starts: `pnpm dev`
- [ ] Test endpoint in Swagger UI

## Best Practices

### Error Handling

- Use custom error classes from `src/domain/errors/`
- Provide meaningful error messages
- Handle edge cases appropriately
- Use proper HTTP status codes

### Validation

- Validate at the DTO level
- Use Zod for schema validation
- Provide clear validation error messages
- Sanitize input data

### Testing

- Write tests for each layer
- Mock external dependencies
- Test both success and error scenarios
- Maintain high test coverage

### Documentation

- Keep API documentation up to date
- Provide realistic examples
- Document all possible responses
- Use consistent naming conventions

This template ensures consistency across all endpoints while maintaining the Clean Architecture principles of the project.
