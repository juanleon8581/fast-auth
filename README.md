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
├── .env.example                   # Environment variables template
├── package.json                   # Dependencies and scripts
└── tsconfig.json                  # TypeScript configuration
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables file:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start the server in development mode
- `npm run build` - Build the project
- `npm start` - Start the server in production mode
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run the linter
- `npm run lint:fix` - Run the linter and fix errors automatically
- `npm run format` - Format code with Prettier

## API Documentation

The API documentation is available via Swagger UI:
- **Development**: `http://localhost:3000/api-docs`
- **Production**: `https://your-domain.com/api-docs`

### Quick Endpoints
- `GET /health` - Health check
- `GET /api/` - API information
- `POST /api/auth/register` - User registration

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
- npm >= 8.0.0

## License

MIT