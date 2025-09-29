# Fast Auth API

Authentication API built with Express.js and TypeScript following Clean Architecture principles.

## Features

- ✅ Express.js with TypeScript
- ✅ Clean Architecture
- ✅ Environment variables validation with Zod
- ✅ Security middlewares (Helmet, CORS)
- ✅ API documentation with Swagger
- ✅ Linting with ESLint
- ✅ Code formatting with Prettier
- ✅ Testing with Jest
- ✅ Containerization with Docker
- ✅ Supabase integration for authentication

## Project Structure

```
├── docs/                           # Project documentation
│   └── api/                       # API documentation (Swagger)
├── src/
│   ├── app.ts                     # Main entry point
│   ├── config/                    # Application configurations
│   ├── domain/                    # Domain layer (entities, use cases)
│   ├── infrastructure/            # Infrastructure layer (databases, external services)
│   └── presentation/              # Presentation layer (controllers, routes)
├── supabase/                      # Supabase configuration
│   └── config.toml               # Local Supabase configuration
├── .env.example                   # Environment variables template
├── package.json                   # Dependencies and scripts
└── tsconfig.json                  # TypeScript configuration
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy the environment variables file:
   ```bash
   cp .env.example .env
   ```
4. Set up Supabase (see [Supabase Setup](#supabase-setup) section)
5. Start the development server:
   ```bash
   pnpm run dev
   ```

## Supabase Setup

This project uses Supabase for authentication and database management. You can use either a local Supabase instance or connect to a remote Supabase project.

### Option 1: Local Supabase (Recommended for Development)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start local Supabase:
   ```bash
   supabase start
   ```

3. The local Supabase will be available at:
   - API URL: `http://localhost:54321`
   - Database URL: `postgresql://postgres:postgres@localhost:54322/postgres`
   - Studio URL: `http://localhost:54323`

4. Update your `.env` file with local Supabase credentials:
   ```bash
   SUPABASE_URL=http://localhost:54321
   SUPABASE_ANON_KEY=your-local-anon-key
   ```

### Option 2: Remote Supabase Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Update your `.env` file:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

## Available Scripts

- `pnpm run dev` - Start the server in development mode
- `pnpm run build` - Build the project
- `pnpm start` - Start the server in production mode
- `pnpm test` - Run tests
- `pnpm run test:watch` - Run tests in watch mode
- `pnpm run test:coverage` - Run tests with coverage
- `pnpm run lint` - Run the linter
- `pnpm run lint:fix` - Run the linter and fix errors automatically
- `pnpm run format` - Format code with Prettier

## API Documentation

The API documentation is available via Swagger UI:
- **Development**: `http://localhost:3000/api-docs`
- **Production**: `https://your-domain.com/api-docs`

### Authentication Endpoints

#### Public Endpoints (No authentication required)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/request-reset-password-email` - Request password reset email

#### Protected Endpoints (Authentication required)
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/update-user` - Update user information
- `PUT /api/auth/update-user-password` - Update user password

#### General Endpoints
- `GET /health` - Health check
- `GET /api/` - API information

## Docker

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker build -t fast-auth .
docker run -p 3000:3000 fast-auth
```

## Requirements

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Supabase CLI (for local development)

## Environment Variables

Make sure to configure the following environment variables in your `.env` file:

```bash
# Environment
NODE_ENV=development
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_minimum_32_characters_long
```

## License

MIT