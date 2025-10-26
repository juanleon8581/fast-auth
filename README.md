# Fast Auth API

A backend API acting as a proxy for Supabase Auth, with encrypted request handling and advanced logging. Built with Express, TypeScript, Prisma, and pnpm.

## 🚀 Features

- Authentication via Supabase Auth (JWT-based flows)
- PostgreSQL database with Prisma ORM
- Clean Architecture with modular, feature-first domain structure
- Advanced logging with Winston and PostgreSQL
- Encrypted request payload support
- Comprehensive testing with Jest
- ESLint + Prettier with consistent formatting

## 📁 Project Structure (Feature-first)

```
src/
├── app.ts
├── config/
│   ├── strings/
│   └── tests/
├── domain/                     # Business logic (feature-first)
│   ├── auth/                   # Authentication feature
│   │   ├── dtos/
│   │   ├── entities/
│   │   ├── interfaces/
│   │   ├── repositories/
│   │   └── use-cases/
│   ├── user/                   # User profile & updates
│   ├── crypto/                 # Cross-cutting crypto contracts & use-cases
│   ├── log/                    # Logging contracts & use-cases
│   └── shared/                 # Shared interfaces, errors, types, validators
├── infrastructure/             # Frameworks & drivers (implementations)
│   ├── external/
│   │   └── auth/               # External Auth capability (driver + datasource)
│   │       ├── auth.client.ts  # Driver for external provider (Supabase SDK)
│   │       ├── datasources/
│   │       ├── mappers/
│   │       └── validators/
│   ├── persistence/            # ORM/database client + datasources
│   │   ├── database.client.ts  # Driver for database (Prisma client)
│   │   ├── datasource/
│   │   │   └── log.datasource.ts
│   │   └── mappers/
│   ├── services/               # Cross-cutting infra services
│   │   ├── crypto/
│   │   │   ├── adapter/
│   │   │   ├── crypto.service.ts
│   │   │   └── validators/
│   │   └── logger/
│   │       ├── adapter/
│   │       ├── interfaces/
│   │       ├── logger.service.ts
│   │       └── validators/
│   └── helpers/
│       └── validators/
│           └── processError.validator.ts
├── presentation/               # HTTP layer
│   ├── __tests__/
│   ├── auth/
│   ├── controller/
│   ├── middlewares/
│   ├── routes.ts
│   ├── server.ts
│   └── utils/
└── prisma/
```

### Import Policy

- Explicit per-file imports only; barrel files (`index.ts`) are not allowed.
- Prefer `@/domain/<feature>/<type>/<file>` for clarity.
- Infrastructure depends on domain contracts only; avoid cross-imports between `external/`, `persistence`, and `services` except via domain contracts.
- Note: Barrels are also prohibited in `src/domain/shared/validators`; import per-file from `@/domain/shared/validators/<file>`.

Examples:

```ts
import { LoginDto } from "@/domain/auth/dtos/login.dto";
import { RegisterUser } from "@/domain/auth/use-cases/register-user";
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";
import { EMAIL_BASIC_REGEX } from "@/domain/shared/validators/regex.validators";
```

## 🛠️ Setup

```bash
pnpm install
cp .env.example .env.dev
```

Configure environment variables in `.env.dev`:

```env
NODE_ENV=dev
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
```

### Supabase (local)

```bash
npx supabase start
```

Update `.env.dev` with local Supabase credentials.

### Database (Prisma)

```bash
# Development
pnpm db:migrate:dev
pnpm db:push:dev
pnpm db:studio:dev

# Production
pnpm db:migrate:prod
pnpm db:push:prod
pnpm db:studio:prod
```

## 📦 Scripts

```bash
pnpm dev             # Start dev server
pnpm build           # Compile TypeScript
pnpm start           # Start production server

# Testing
pnpm test            # Run tests
pnpm test:watch      # Watch mode
pnpm test:coverage   # Coverage report

# Lint & Format
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm code:check
pnpm code:fix
```

## 🧪 Testing

Run the full suite:

```bash
pnpm test
```

Feature tests are co-located in `__tests__` folders inside feature directories.

## 🏗️ Architecture

- Clean Architecture: presentation → application/use-cases → domain → infrastructure
- Domain is feature-first and contains pure business logic (entities, dtos, interfaces, use-cases, repository contracts)
- Infrastructure implements data access and external integrations (Supabase, Prisma, services)
- Presentation handles HTTP concerns (controllers, routes, middleware)

See detailed guide: `docs/development/architecture-guide.md` and ADRs under `docs/development/adr/`.

## 🔒 Security

- OWASP-aligned input validation and error handling
- Encrypted request payloads support
- JWT secrets length and secure config
- Logging without leaking sensitive data

## 📚 Documentation

- Architecture Guide: `docs/development/architecture-guide.md`
- API Docs (OpenAPI/Swagger): `docs/api/`
- ADRs: `docs/development/adr/`

## 🤝 Contributing

1. Create a branch: `git checkout -b feature/your-feature`
2. Implement with tests
3. Run `pnpm code:check` and `pnpm test`
4. Open a PR

## 📄 License

MIT (see `LICENSE`).
