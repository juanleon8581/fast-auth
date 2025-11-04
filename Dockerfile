# syntax=docker/dockerfile:1.6

# Builder stage: install all deps, build TypeScript, then prune to prod
FROM node:24-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app 

COPY pnpm-lock.yaml package.json ./

RUN --mount=type=cache,target=/pnpm/store \
    pnpm fetch --frozen-lockfile

RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --offline

COPY . .

# Generate Prisma client
RUN pnpm db:generate

# Build (runs tests + compile TS per package.json)
RUN pnpm build

# Prune dev dependencies to keep only production deps
ENV CI=true
RUN pnpm prune --prod

# Runtime stage: copy compiled app and production deps
FROM node:24-alpine AS runner

RUN corepack enable
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

# Copy only what is needed at runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docs ./docs
COPY --from=builder /app/prisma ./prisma

# Ensure keys directory exists at runtime
RUN mkdir -p ./.keys

EXPOSE 3000

# Generate Prisma client, keys (idempotent) and start the server
CMD [ "sh", "-c", "node dist/scripts/generateKeys.js && node dist/app.js" ]
