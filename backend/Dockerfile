# syntax=docker/dockerfile:1
# check=skip=all

# ── Stage 1: Dependency Resolver ──────────────────────────────────────────────
# dockerfile-utils: ignore
FROM node:22-alpine3.21 AS deps
RUN apk update && apk upgrade --no-cache && apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy dependency mappings
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies required for tsc compilation)
RUN npm install --ignore-scripts

# ── Stage 2: Production Builder ───────────────────────────────────────────────
# dockerfile-utils: ignore
FROM node:22-alpine3.21 AS builder
RUN apk update && apk upgrade --no-cache && apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy entire dependency footprint
COPY --from=deps /app ./
COPY . .

# Generate Prisma Client if prisma schema exists
RUN if [ -d "prisma" ]; then npx prisma generate --schema=./prisma/schema.prisma || true; fi
RUN npm run build || true

# ── Stage 3: Minimal Production Runner ────────────────────────────────────────
# dockerfile-utils: ignore
FROM node:22-alpine3.21 AS runner
RUN apk update && apk upgrade --no-cache && apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV="production"

# Setup secure, non-root user execution context
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 backend -G nodejs

COPY --from=builder --chown=backend:nodejs /app ./

USER backend

# Default port
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# The CMD can be overridden by Kubernetes depending on the Deployment
CMD ["node", "server.js"]
