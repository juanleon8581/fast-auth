# Fast Auth API - Developer Documentation

This documentation provides comprehensive guidance for developers working on the Fast Auth API project. The project follows Clean Architecture principles with a clear separation of concerns across different layers.

## Table of Contents

- [Project Architecture](#project-architecture)
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

### Infrastructure Layer (`src/infrastructure/`)
- **Datasources**: External data source implementations
- **Validators**: Input validation logic
- **Config**: Infrastructure configurations

### Presentation Layer (`src/presentation/`)
- **Controllers**: HTTP request handlers
- **Routes**: API route definitions
- **Middlewares**: Request/response processing
- **Server**: Express server configuration

## Development Guidelines

### Prerequisites
- Node.js >= 18.0.0
- pnpm package manager
- TypeScript knowledge
- Understanding of Clean Architecture principles

### Getting Started
1. Clone the repository
2. Install dependencies: `pnpm install`
3. Copy environment file: `cp .env.example .env`
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

- [ ] Define DTO in `src/infrastructure/dtos/`
- [ ] Create repository contract in `src/domain/repositories/`
- [ ] Implement use case in `src/domain/use-cases/`
- [ ] Create validator in `src/infrastructure/validators/`
- [ ] Implement datasource in `src/infrastructure/datasources/`
- [ ] Create controller in `src/presentation/controller/`
- [ ] Define routes in `src/presentation/[feature]/routes/`
- [ ] Create API documentation in `docs/api/`
- [ ] Write comprehensive tests
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
```bash
pnpm lint              # Check code quality
pnpm lint:fix          # Fix linting issues
pnpm format            # Format code
pnpm code:check        # Run all quality checks
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

### Getting Help

1. Check existing documentation
2. Review similar implementations in the codebase
3. Run diagnostic commands:
   ```bash
   pnpm test              # Verify functionality
   pnpm lint              # Check code quality
   pnpm build             # Verify compilation
   ```

## Next Steps

For detailed implementation guides, refer to:
- [Endpoint Development Guide](./endpoint-development-guide.md)
- [Template Files](./templates/)
- [Testing Guide](./testing-templates.md)

These documents provide step-by-step instructions and reusable templates for common development tasks.