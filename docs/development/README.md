# Fast Auth API - Developer Documentation

This documentation provides comprehensive guidance for developers working on the Fast Auth API project. The project follows Clean Architecture principles with a clear separation of concerns across different layers.

## Table of Contents

- [Project Architecture](#project-architecture)
- [Development Environment](#development-environment)
- [Development Guidelines](#development-guidelines)
- [Creating New API Endpoints](#creating-new-api-endpoints)
- [Testing Strategy](#testing-strategy)
- [API Documentation](#api-documentation)
- [Code Standards](#code-standards)
- [Troubleshooting](#troubleshooting)

## Project Architecture

The project follows Clean Architecture with three main layers:

### Domain Layer (`src/domain/`)

- **Entities**: Core business objects
- **Use Cases**: Business logic implementation
- **Repositories**: Abstract contracts for data access
- **DTOs**: Data transfer objects
- **Errors**: Custom error definitions
- **Shared Validators**: Regex and input patterns under `src/domain/shared/validators`

#### Import Policy (No Barrels)
- Explicit per-file imports only; barrels (`index.ts`) are prohibited, including under `src/domain/shared/validators`.
- Prefer `@/domain/<feature>/<type>/<file>` for clarity.

Examples:
```ts
import { EMAIL_BASIC_REGEX } from "@/domain/shared/validators/regex.validators";
```

### Infrastructure Layer (`src/infrastructure/`)

- **External/Auth**: `external/auth/` (driver `auth.client.ts`, `datasources/`, `mappers/`, `validators/`)
- **Persistence**: `persistence/` (driver `database.client.ts`, `datasource/` such as `log.datasource.ts`, `mappers/`)
- **Services**: `services/` (crypto and logger with `adapter/`, `*.service.ts`, `validators/`)
- **Helpers**: `helpers/validators/` (infrastructure validators such as `processError.validator.ts`)

- **Datasources**: External data source implementations
- **Validators**: Input validation logic
- **Config**: Infrastructure configurations

### Presentation Layer (`src/presentation/`)

- **Controllers**: HTTP request handlers
- **Routes**: API route definitions
- **Middlewares**: Request/response processing
- **Server**: Express server configuration

## Development Environment

The project supports both local and containerized development environments to accommodate different developer preferences and deployment scenarios.

### Local Development

Traditional development setup with direct Node.js execution:

```bash
# Setup
pnpm install
cp .env.example .env.dev

# Start development
pnpm dev              # Hot reload development server
pnpm test             # Run tests locally
pnpm lint             # Code quality checks
```

**Advantages:**
- Direct access to Node.js debugging tools
- Faster startup times
- Native IDE integration
- Direct file system access

### Docker Development

Containerized development environment for consistency and isolation:

```bash
# Setup
cp .env.example .env.dev

# Development workflow
pnpm docker:dev       # Start development environment with hot reload
pnpm test:docker      # Run tests in container
pnpm db:migrate:docker # Database operations
pnpm shell:docker     # Access container shell for debugging
```

**Advantages:**
- Environment consistency across team
- Isolated dependencies
- Production-like environment
- Easy cleanup and reset

### Docker Commands Reference

| Command | Purpose | Environment |
|---------|---------|-------------|
| `pnpm docker:dev` | Start development with hot reload | Development |
| `pnpm docker:prod` | Start production environment | Production |
| `pnpm docker:stop` | Stop all containers | Both |
| `pnpm docker:clean` | Remove containers and volumes | Both |
| `pnpm test:docker` | Run tests in container | Development |
| `pnpm db:migrate:docker` | Run database migrations | Development |
| `pnpm db:studio:docker` | Open Prisma Studio | Development |
| `pnpm shell:docker` | Access container shell | Development |

### Choosing Your Environment

**Use Local Development when:**
- You need direct debugging capabilities
- Working on performance-sensitive code
- Prefer faster iteration cycles
- Have stable local Node.js setup

**Use Docker Development when:**
- Working in a team with different OS/environments
- Need production-like environment
- Want isolated dependencies
- Preparing for containerized deployment

## Development Guidelines

### Prerequisites

- Node.js >= 18.0.0
- pnpm package manager
- TypeScript knowledge
- Understanding of Clean Architecture principles

### Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Copy environment file: `cp .env.example .env.dev`
4. Start development server: `pnpm dev`
5. Access API documentation: `http://localhost:3000/api-docs`

### Development Workflow

1. Create feature branch from main
2. Implement changes following the architecture
3. Write comprehensive tests
4. Update API documentation
5. Run quality checks: `pnpm code:check`
6. Submit pull request

## Creating New API Endpoints

Follow this step-by-step guide to create new endpoints that maintain architectural consistency.

### Step-by-Step Implementation

Refer to the detailed guides in this documentation folder:

- [Endpoint Development Guide](./endpoint-development-guide.md)
- [Template Files](./templates/)
- [Testing Templates](./testing-templates.md)

### Quick Reference Checklist

- [ ] Define DTO in `src/domain/<feature>/dtos/`
- [ ] Create repository contract in `src/domain/<feature>/repositories/`
- [ ] Implement use case in `src/domain/<feature>/use-cases/`
- [ ] Create validator in infrastructure according to the capability (e.g., `src/infrastructure/external/auth/validators/`)
- [ ] Implement datasource in the corresponding capability (e.g., `src/infrastructure/external/auth/datasources/` or `src/infrastructure/persistence/datasource/`)
- [ ] Create controller in `src/presentation/controller/` (or feature subfolder)
- [ ] Define routes in `src/presentation/routes.ts` (or feature subfolder)
- [ ] Create API documentation in `docs/api/`
- [ ] Write comprehensive tests (unit + integration)
- [ ] Verify in Swagger UI

## Testing Strategy

### Test Types

- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **API Tests**: End-to-end endpoint testing

### Test Commands

```bash
pnpm test              # Run all tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage report
```

### Test Structure

Each layer should have corresponding tests:

- Domain: Business logic validation
- Infrastructure: Data access and validation
- Presentation: HTTP handling and routing

## API Documentation

### Swagger Documentation

API documentation is automatically generated from YAML files in `docs/api/`:

- **Paths**: `docs/api/paths/[feature]/[endpoint].path.yml`
- **Schemas**: `docs/api/schemas/[feature]/[schema].schema.yml`
- **Tags**: `docs/api/tags.docs.yml`

### Documentation Standards

- Use clear, descriptive summaries
- Include comprehensive examples
- Document all possible responses
- Maintain consistent naming conventions

### Auth Payload Notes

- Register
  - Required: `name`, `lastname`, `email`, `password`
  - Optional: `phone`
  - Optional: `role` (`USER`, `MODERATOR`, `ADMIN`), default `USER`
  - Optional: `metadata` (object with string keys and string values)
  - Align Swagger with `RegisterDto` and `RegisterValidator`.

- Update User
  - Supports: `name`, `lastname`, `display_name`, `role`, `email_verified`
  - `email_verified`: include only when `true`; omit `false`
  - Do not include password fields here; password changes are handled separately
  - Align Swagger with `UpdateUserDto` and datasource behavior.

## Code Standards

### TypeScript

- Strict type checking enabled
- Use interfaces for contracts
- Implement proper error handling
- Follow naming conventions

### ESLint & Prettier

- Automatic code formatting
- Consistent code style
- Import organization
- Error prevention

### Quality Commands

#### Local Environment

```bash
pnpm lint              # Check code quality
pnpm lint:fix          # Fix linting issues
pnpm format            # Format code
pnpm code:check        # Run all quality checks
```

#### Docker Environment

```bash
pnpm test:docker       # Run tests in container
pnpm shell:docker      # Access container for manual testing
```

For other quality checks in Docker, use the shell access:

```bash
pnpm shell:docker
# Inside container:
pnpm lint
pnpm format
pnpm code:check
```

## Troubleshooting

### Common Issues

#### ESLint Configuration

If you encounter module resolution issues:

- Ensure `eslint.config.mjs` is properly configured
- Check TypeScript path mappings in `tsconfig.json`

#### Swagger Documentation

If documentation doesn't update:

- Verify YAML syntax in documentation files
- Check file paths in `swagger.config.ts`
- Restart development server

#### Test Failures

For test-related issues:

- Ensure all dependencies are installed
- Check test environment configuration
- Verify mock implementations

#### Docker Issues

Common Docker-related problems:

**Container won't start:**
```bash
# Check container logs
pnpm docker:stop
pnpm docker:clean
pnpm docker:dev
```

**Port conflicts:**
- Ensure port 3000 is not in use by other applications
- Check `docker-compose.yaml` port mappings

**Volume mounting issues:**
```bash
# Clean and restart
pnpm docker:clean
pnpm docker:dev
```

**Database connection issues in Docker:**
```bash
# Verify database migrations
pnpm db:migrate:docker
```

### Getting Help

1. Check existing documentation
2. Review similar implementations in the codebase
3. Run diagnostic commands:

   **Local Environment:**
   ```bash
   pnpm test              # Verify functionality
   pnpm lint              # Check code quality
   pnpm build             # Verify compilation
   ```

   **Docker Environment:**
   ```bash
   pnpm test:docker       # Verify functionality in container
   pnpm shell:docker      # Access container for debugging
   ```

## Next Steps

For detailed implementation guides, refer to:

- [Endpoint Development Guide](./endpoint-development-guide.md)
- [Template Files](./templates/)
- [Testing Guide](./testing-templates.md)

These documents provide step-by-step instructions and reusable templates for common development tasks.
