# ── Stage 1: Dependency Resolver ──────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency mappings
COPY package.json ./

# Install dependencies
RUN npm install

# ── Stage 2: Production Builder ───────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy entire dependency footprint
COPY --from=deps /app ./
COPY . .

# Generate Prisma Client if prisma schema exists
RUN if [ -d "prisma" ]; then npx prisma generate; fi

# ── Stage 3: Minimal Production Runner ────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Setup secure, non-root user execution context
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app ./

USER nodejs

# Default port
EXPOSE 3001

# The CMD can be overridden by Kubernetes depending on the Deployment
CMD ["node", "api.js"]
