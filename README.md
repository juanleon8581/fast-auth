# Fast Auth API

Authentication API built with Express.js and TypeScript following Clean Architecture principles.

## Features

- ✅ Express.js with TypeScript
- ✅ Clean Architecture
- ✅ Environment variables validation with Zod
- ✅ Security middlewares (Helmet, CORS)
- ✅ Linting with ESLint
- ✅ Code formatting with Prettier
- ✅ Testing with Jest
- ✅ Containerization with Docker

## Project Structure

```
├── .env.example                    # Environment variables template
├── .gitignore                      # Files ignored by Git
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── README.md                       # Project documentation
├── Dockerfile                      # Configuration for containerization
├── docker-compose.yml              # Container orchestration
└── src/
    ├── app.ts                      # Main entry point
    ├── config/                     # Configurations
    ├── domain/                     # Domain layer
    ├── infrastructure/             # Infrastructure layer
    └── presentation/               # Presentation layer
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

## API Endpoints

### Health Check
- `GET /health` - Check server status
- `GET /api/` - Basic API information

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