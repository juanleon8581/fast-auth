# ADR 0001: Feature-first Domain Structure with Explicit Imports (No Barrels)

Status: Accepted
Date: 2025-10-20
Authors: Fast Auth Maintainers

## Context

Originally, the domain layer was organized horizontally by technical type (e.g., `dtos/`, `entities/`, `interfaces/`, `repositories/`, `use-cases/`). As features grew (auth, user, crypto, log), discoverability and maintainability suffered: related files were dispersed across multiple directories, imports became deep and fragile, and onboarding required traversing the entire codebase to understand a single feature.

We decided to migrate to a feature-first structure under `src/domain`, grouping all artifacts belonging to the same domain feature (e.g., `auth`, `user`, `crypto`, `log`) while keeping clean boundaries with infrastructure and presentation layers. Additionally, we explicitly prohibit barrel files (`index.ts` re-exports) to avoid hidden couplings and import cycles.

## Decision

1. Organize the domain layer by feature:
   - `src/domain/auth/{dtos,entities,interfaces,repositories,use-cases}`
   - `src/domain/user/{dtos,entities,interfaces,repositories,use-cases}`
   - `src/domain/crypto/{dtos,interfaces,use-cases}` (cross-cutting contracts)
   - `src/domain/log/{dtos,entities,interfaces,repositories,use-cases}`
   - `src/domain/shared/{interfaces,errors,types}` for reusable, cross-feature contracts

2. Explicit imports only — no barrel files:
   - Imports must target concrete files (e.g., `@/domain/auth/dtos/login.dto`).
   - Avoid `index.ts` that re-export multiple symbols.

3. Enforce clean boundaries:
   - Domain does not depend on infrastructure or presentation.
   - Cross-cutting modules (`crypto`, `log`) must not depend on business features.
   - Shared contracts reside in `src/domain/shared` and may be imported by any feature.

4. Co-located tests per feature:
   - Test files live near the code they validate (e.g., `src/domain/auth/use-cases/__tests__`).

5. Aliases and tooling:
   - Keep `@` alias pointing to `src/` and prefer `@/domain/<feature>/...` for clarity.
   - Jest `moduleNameMapper` mirrors TypeScript path aliases.

## Rationale

- Improves cohesion by grouping feature-related artifacts.
- Reduces accidental coupling and deep imports.
- Eases navigation, onboarding, and feature-focused testing.
- Explicit imports increase transparency and prevent cycle creation.

## Consequences

- Pros:
  - Clear feature boundaries and discoverability.
  - Easier incremental change and refactoring within a feature.
  - Better alignment with SOLID and Clean Architecture.

- Cons:
  - More verbose imports without barrels.
  - Initial churn updating import paths.

## Alternatives Considered

- Keep horizontal structure: simpler initially but poor feature discoverability and modularity.
- Semi-vertical: subfolders by feature under each technical type; still disperses artifacts and weakens encapsulation.

## Import Policy

- Allowed: explicit file imports under `@/domain/<feature>/<type>/<file>`.
- Disallowed: importing from barrel files (`index.ts`) and deep cross-feature imports.
- Prefer importing contracts from `shared` when types are reused across features.

### Examples

```ts
// ✅ Auth DTO
import { LoginDto } from "@/domain/auth/dtos/login.dto";

// ✅ Use case
import { RegisterUser } from "@/domain/auth/use-cases/register-user";

// ✅ Shared contracts
import { TRawJson } from "@/domain/shared/interfaces/general.interfaces";

// ❌ Barrel import — not allowed
// import { LoginDto } from "@/domain/auth";
```

## Testing Strategy

- Co-locate unit tests under each feature folder (`__tests__`).
- Prefer relative imports inside feature tests (`../register-user`) for proximity.
- Keep integration tests aligned with presentation and infrastructure boundaries.

## Migration Plan (completed incrementally)

1. Create feature directories (`auth`, `user`, `crypto`, `log`, `shared`).
2. Move DTOs, use-cases, entities, interfaces, repositories to respective feature folders.
3. Update imports across the project to explicit file paths.
4. Run tests and build after each feature migration.
5. Remove legacy horizontal folders once unused.

## Risks & Mitigations

- Broken imports: migrate feature-by-feature and run CI after each step.
- Import cycles: enforce no barrels and keep cross-cutting modules dependency-free.
- Alias inconsistencies: keep `@` stable and mirror in Jest config.

## Status

- Accepted and implemented. Future features should follow this structure and import policy.
