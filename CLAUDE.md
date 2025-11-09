# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fast Auth API is a sophisticated backend authentication proxy for Supabase Auth, built with Clean Architecture principles. It features encrypted request handling, advanced logging, and enterprise-grade patterns using Node.js, TypeScript, Express, Prisma, and PostgreSQL.

## Development Commands

### Local Development
```bash
pnpm dev              # Start development server with hot reload
pnpm build            # Build for production (runs tests + TypeScript compilation)
pnpm start            # Start production server (generates keys first)

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage report

# Code Quality
pnpm lint             # ESLint code checking
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Prettier code formatting
pnpm format:check     # Check formatting
pnpm code:check       # Run all quality checks (lint + format:check)
pnpm code:fix         # Fix all quality issues (lint:fix + format)
```

### Database Operations
```bash
# Development environment
pnpm db:migrate:dev   # Run development migrations
pnpm db:push:dev      # Push schema changes to dev database
pnpm db:studio:dev    # Open Prisma Studio for dev database

# Production environment
pnpm db:migrate:prod  # Run production migrations
pnpm db:push:prod     # Push schema changes to production database
pnpm db:studio:prod   # Open Prisma Studio for production database

# Client generation
pnpm db:generate      # Generate Prisma client
```

### Docker Development
```bash
# Environment management
pnpm docker:dev       # Start development container with hot reload
pnpm docker:prod      # Start production container
pnpm docker:stop      # Stop all containers
pnpm docker:clean     # Remove containers and volumes

# Testing and debugging in Docker
pnpm test:docker      # Run tests in container
pnpm db:migrate:docker # Run migrations in container
pnpm db:studio:docker # Open Prisma Studio in container
pnpm shell:docker     # Access container shell for debugging
```

## Architecture Overview

The project implements **Clean Architecture** with strict separation of concerns:

### Layer Structure
- **Domain Layer** (`src/domain/`): Pure business logic, entities, use cases, repository contracts
- **Infrastructure Layer** (`src/infrastructure/`): External services, database access, implementations
- **Presentation Layer** (`src/presentation/`): HTTP controllers, routes, middleware

### Key Architectural Patterns
- **Repository Pattern**: Data access abstraction
- **Dependency Injection**: Interface-based dependency management
- **Factory Pattern**: Object creation without specifying classes
- **Strategy Pattern**: Runtime algorithm selection
- **Event-Driven Architecture**: Domain events and handlers

### Import Policy (Critical)
- **No barrel files**: Explicit per-file imports only (`index.ts` files are prohibited)
- Use explicit paths: `@/domain/<feature>/<type>/<file>`
- Infrastructure depends only on domain contracts
- Cross-cutting modules (`crypto`, `log`) must not depend on business features

Example imports:
```ts
import { LoginDto } from "@/domain/auth/dtos/login.dto";
import { RegisterUser } from "@/domain/auth/use-cases/register-user";
import { EMAIL_BASIC_REGEX } from "@/domain/shared/validators/regex.validators";
```

## Directory Structure

```
src/
├── domain/                     # Business logic (feature-first)
│   ├── auth/                   # Authentication module
│   │   ├── dtos/              # Data transfer objects
│   │   ├── entities/          # Business entities
│   │   ├── interfaces/        # Contracts
│   │   ├── repositories/      # Repository contracts
│   │   └── use-cases/         # Business logic
│   ├── user/                  # User management module
│   ├── crypto/                # Cryptography utilities
│   ├── log/                   # Logging domain
│   └── shared/                # Shared components
├── infrastructure/             # External implementations
│   ├── external/auth/         # Supabase integration
│   ├── persistence/           # Database access
│   ├── services/              # Cross-cutting services
│   └── config/                # Configuration
├── presentation/              # HTTP layer
│   ├── auth/                  # Auth HTTP handlers
│   ├── controller/            # Controllers
│   ├── middlewares/           # Middleware
│   ├── routes.ts              # Route definitions
│   └── server.ts              # Express server
└── prisma/                    # Database schema
```

## Development Environment Setup

### Local Development
1. Install dependencies: `pnpm install`
2. Setup environment: `cp .env.example .env.dev`
3. Configure database connection in `.env.dev`
4. Start development: `pnpm dev`
5. Access API docs: `http://localhost:3000/api-docs`

### Docker Development
1. Setup environment: `cp .env.example .env.dev`
2. Start container: `pnpm docker:dev`
3. Run migrations: `pnpm db:migrate:docker`
4. Access container: `pnpm shell:docker`

## Technology Stack

- **Runtime**: Node.js >= 18.0.0
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth (JWT-based)
- **Package Manager**: pnpm
- **Testing**: Jest with supertest
- **Code Quality**: ESLint + Prettier
- **Security**: Helmet, CORS, Zod validation
- **Logging**: Winston with PostgreSQL transport
- **Cryptography**: jose library for JWT operations

## Testing Strategy

### Test Structure
- Tests co-located in `__tests__` folders
- Unit tests for individual components
- Integration tests for component interactions
- API tests for endpoint validation

### Running Tests
```bash
# Local testing
pnpm test              # Run all tests
pnpm test:watch        # Watch mode for development
pnpm test:coverage     # Generate coverage report

# Docker testing
pnpm test:docker       # Run tests in container
```

### Test Configuration
- Jest with ts-jest for TypeScript
- Coverage collection from source files
- Mock setup for cryptographic libraries
- Test timeout: 10 seconds

## API Documentation

### Swagger/OpenAPI
- **Path Definitions**: `docs/api/paths/[feature]/[endpoint].path.yml`
- **Schema Definitions**: `docs/api/schemas/[feature]/[schema].schema.yml`
- **Live Documentation**: `http://localhost:3000/api-docs`
- **Auto-regeneration**: Updates on each request in development

### Documentation Standards
- Use clear, descriptive summaries
- Include comprehensive examples
- Document all possible responses
- Maintain consistent naming conventions

## Database Schema

### Key Models
- **Users**: Extends Supabase Auth with additional fields
- **Logs**: Application logging with PostgreSQL transport
- **Enums**: User roles and log levels

### Migration Workflow
```bash
# Development
pnpm db:migrate:dev   # Apply migrations
pnpm db:push:dev      # Push schema changes

# Production
pnpm db:migrate:prod  # Deploy migrations
pnpm db:push:prod     # Push production changes
```

## Security Considerations

### Authentication & Authorization
- JWT-based authentication via Supabase
- Encrypted request payload support
- Security headers via Helmet middleware
- CORS configuration for cross-origin handling

### Data Protection
- Zod schema validation for all inputs
- Strong password requirements
- Environment-based configuration
- No sensitive data in logs

## Code Quality Standards

### TypeScript Configuration
- Strict mode enabled
- Path aliases: `@/*` maps to `src/*`
- Module resolution: Node with CommonJS
- Source maps and declarations enabled

### ESLint & Prettier
- TypeScript ESLint with strict rules
- Prettier integration for formatting
- Jest globals for test files
- Custom rules for code quality

### Quality Checks
```bash
pnpm code:check       # Run all quality checks
pnpm code:fix         # Fix all quality issues
```

## Common Development Patterns

### Creating New Endpoints
1. Define DTO in `src/domain/<feature>/dtos/`
2. Create repository contract in `src/domain/<feature>/repositories/`
3. Implement use case in `src/domain/<feature>/use-cases/`
4. Create validator in infrastructure layer
5. Implement datasource in appropriate infrastructure module
6. Create controller in presentation layer
7. Define routes in `src/presentation/routes.ts`
8. Create API documentation in `docs/api/`
9. Write comprehensive tests
10. Verify in Swagger UI

### Error Handling
- Custom error hierarchy in domain layer
- Structured error responses
- Proper error logging without sensitive data
- Consistent error format across API endpoints

## Environment Variables

### Required Variables
- `NODE_ENV`: Environment (dev/prod)
- `PORT`: Server port
- `DATABASE_URL`: PostgreSQL connection string
- `SUPABASE_URL`: Supabase instance URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `JWT_SECRET`: Secret for JWT operations

### Optional Variables
- `ENCRYPTION_PASSPHRASE`: For request encryption
- `LOG_LEVEL`: Winston logging level

## Troubleshooting

### Common Issues
- **Port conflicts**: Ensure port 3000 is available
- **Database connection**: Verify `DATABASE_URL` configuration
- **Test failures**: Check environment variables and mocks
- **Docker issues**: Use `pnpm docker:clean` to reset containers

### Diagnostic Commands
```bash
# Local environment
pnpm test              # Verify functionality
pnpm build             # Verify compilation
pnpm code:check        # Verify code quality

# Docker environment
pnpm test:docker       # Verify functionality in container
pnpm shell:docker      # Access container for debugging
```