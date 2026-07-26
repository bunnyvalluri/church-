# ── Stage 1: Dependency Resolver ──────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency mappings for monorepo
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Copy prisma schemas to ensure postinstall generation succeeds
COPY frontend/prisma ./frontend/prisma/
COPY backend/prisma ./backend/prisma/

# Install exact dependencies
RUN npm ci --ignore-scripts

# ── Stage 2: Production Builder ───────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy entire dependency footprint (including workspace symlinks)
COPY --from=deps /app ./
COPY . .

# Generate Prisma Client (using workspace scripts)
RUN npm run db:generate -w backend || true
RUN npm run db:generate -w frontend || true

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
ENV DATABASE_URL "postgresql://dummy:dummy@localhost:5432/dummy"

# Build the Next.js frontend
RUN npm run build -w frontend

# ── Stage 3: Minimal Production Runner ────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Expose Next.js server port
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Setup secure, non-root user execution context
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static public folders
COPY --from=builder /app/frontend/public ./frontend/public

# Leverage Next.js standalone tracing output
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

USER nextjs

EXPOSE 3000

# In a monorepo, standalone output is usually placed under the package path
CMD ["node", "frontend/server.js"]
