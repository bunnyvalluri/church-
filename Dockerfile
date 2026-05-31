# ── Stage 1: Dependency Resolver ──────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency mappings
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install exact dependencies (caching-optimized)
RUN npm ci

# ── Stage 2: Production Builder ───────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency footprint and source tree
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client and build the application
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npm run build

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
COPY --from=builder /app/public ./public

# Leverage Next.js standalone tracing output to reduce size by 90%
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
