# ADR 0002: Infrastructure "capability-first", technology-agnostic, with drivers and no barrel files

- Status: Accepted
- Date: 2025-10-21
- Authors: Fast Auth API Team

## Context

We needed to improve the Infrastructure layer to:
- Avoid coupling to vendor/technology names in the filesystem.
- Keep clean import boundaries aligned with Clean Architecture.
- Make technology replacement (ORM or Auth provider) easier without impacting domain contracts.
- Co-locate datasources, mappers, validators, and tests by capability.

## Decision

Adopt a capability-first structure for Infrastructure, encapsulating concrete SDKs/clients as drivers, using explicit per-file imports, and prohibiting barrel files. Infrastructure depends on domain contracts and avoids cross-imports between its subcapabilities.

```
src/infrastructure/
├── external/
│   └── auth/               # Capability: external authentication
│       ├── auth.client.ts  # Driver (e.g., Supabase SDK)
│       ├── datasources/
│       ├── mappers/
│       └── validators/
├── persistence/            # Capability: ORM/database access
│   ├── database.client.ts  # Driver (e.g., Prisma Client)
│   ├── datasource/
│   │   └── log.datasource.ts
│   └── mappers/
├── services/               # Cross-cutting infrastructure services
│   ├── crypto/
│   │   ├── adapter/
│   │   ├── crypto.service.ts
│   │   └── validators/
│   └── logger/
│       ├── adapter/
│       ├── interfaces/
│       ├── logger.service.ts
│       └── validators/
└── helpers/
    └── validators/
        └── processError.validator.ts
```

Key points:
- Capability-first grouping: `external/auth`, `persistence`, `services` with their datasources/mappers/validators co-located.
- Drivers per file (`*.client.ts`): concrete SDKs are isolated behind drivers without vendor names in folder paths.
- No barrel files: explicit imports only for traceability and to reduce hidden coupling.
- Domain-first boundaries: infrastructure implements domain contracts; avoid direct cross-imports between `external/`, `persistence/`, and `services`.

## Rationale & Benefits

- Clear abstraction: avoids vendor names in paths (e.g., `external/auth` instead of `external/supabase`).
- Ease of replacement: switching provider/ORM mostly affects drivers and capability-specific datasources.
- Cohesion & testability: co-located tests and validators improve maintenance and discovery.
- Quality & safety: explicit imports reduce accidental dependencies and cycles.

## Import Boundaries

- Infrastructure → Domain: allowed (implements domain contracts).
- Between infrastructure subcapabilities: avoid direct cross-imports; interact via use cases and domain contracts.
- Presentation → Domain: allowed. Presentation → Infrastructure: allowed to orchestrate concrete services/datasources while depending on domain contracts.

## Alternatives Considered

- Technology-first (e.g., `orm/prisma/*`, `external/supabase/*`): rejected due to vendor coupling.
- Barrel-centric with `index.ts`: rejected due to hidden dependencies and poor traceability.
- Flattened generic `datasources/` and `adapters/`: rejected due to reduced cohesion and navigation costs.

## Impact

- README and architecture guide updated to reflect the structure and boundaries.
- Checklists for endpoints reference domain DTOs and infrastructure capability paths.
- Path alias remains (`@` → `src/`); imports stay explicit.

## Example Imports

```ts
// Infrastructure using domain contracts
import { AuthRepository } from "@/domain/auth/repositories/auth.repository";
import { LogRepository } from "@/domain/log/repositories/log.repository";

// Drivers
import { AuthClient } from "@/infrastructure/external/auth/auth.client";
import { DatabaseClient } from "@/infrastructure/persistence/database.client";

// Datasources per capability
import { AuthDatasource } from "@/infrastructure/external/auth/datasources/auth.datasource";
import { LogDatasource } from "@/infrastructure/persistence/datasource/log.datasource";
```

## Migration Plan (completed)

1. Create capability folders and move datasources/mappers/validators.
2. Introduce `*.client.ts` drivers for vendor/technology (Supabase/Prisma).
3. Update imports to explicit paths and existing alias.
4. Run unit/integration tests and build to validate.
5. Update documentation and publish this ADR.

## Consequences

- Consider ESLint rules to enforce import boundaries and forbid barrel files.
- Slightly longer paths, mitigated by alias and IDE tooling.

## Status & Next Steps

- Status: Adopted in `src/infrastructure`.
- Next steps: evaluate ESLint rules for boundaries and continue keeping tests up to date.