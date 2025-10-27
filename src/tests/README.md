# Jest Configuration for Fast Auth

This directory contains the configuration and utilities for unit testing in the Fast Auth project.

## Configuration Files

- `src/config/tests/setup.ts`: Global configuration for tests
- `src/config/tests/test-utils.ts`: Common utilities and helpers for tests
- `jest.config.ts`: Main Jest configuration file (TypeScript format)

## Available Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

```
src/config/tests/
├── setup.ts              # Global configuration
├── test-utils.ts          # Test utilities
└── example.test.ts        # Basic test example
```

## Conventions

### File Naming
- Test files should end with `.test.ts` or `.spec.ts`
- Can be located anywhere within `src/`
- Recommended to create one test file per module/class

### Test Structure
```typescript
describe('Module/Class Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    clearAllMocks(); // Clear mocks
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test value';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('expected result');
  });
});
```

## Available Helpers

### `test-utils.ts`
- `createTestRequest(app)` - Helper to create test requests with supertest
- `mockUser` - Mock user data for tests
- `generateMockToken(payload)` - Generates mock tokens for authentication
- `clearAllMocks()` - Clears all mocks
- `wait(ms)` - Helper to wait for a specific amount of time

## Test Environment Variables

The following variables are automatically configured in `setup.ts`:
- `NODE_ENV=test`
- `PORT=3001`
- `SUPABASE_URL=https://test.supabase.co`
- `SUPABASE_ANON_KEY=test-anon-key`
- `SUPABASE_SERVICE_ROLE_KEY=test-service-role-key`

## Code Coverage

The configuration includes:
- Coverage reports in text, LCOV and HTML formats
- Exclusion of configuration and test files
- Output directory: `coverage/`

## Usage Examples

### Simple Function Test
```typescript
import { validateEmail } from '@/utils/validation';

describe('validateEmail', () => {
  it('should validate correct emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });
});
```

### API Endpoint Test
```typescript
import { createTestRequest } from '@/config/tests/test-utils';
import { app } from '@/app';

describe('POST /auth/register', () => {
  it('should register a valid user', async () => {
    const response = await createTestRequest(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
  });
});
```

## Best Practices

1. **Arrange, Act, Assert**: Clear structure in each test
2. **Descriptive names**: Test names should explain what is being tested
3. **Independent tests**: Each test should be able to run in isolation
4. **Appropriate mocks**: Use mocks for external dependencies
5. **Meaningful coverage**: Aim for high coverage but with quality tests