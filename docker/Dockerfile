# ── Stage 1: Dependency Resolver ──────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency mappings for monorepo
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Copy prisma schemas to ensure postinstall generation succeeds
COPY frontend/prisma ./frontend/prisma/
COPY backend/prisma ./backend/prisma/

# Install exact dependencies
RUN npm ci --ignore-scripts || npm install --ignore-scripts

# ── Stage 2: Production Builder ───────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy entire dependency footprint (including workspace symlinks)
COPY --from=deps /app ./
COPY . .

# Generate Prisma Client
RUN cd frontend && npx prisma generate || true
RUN cd backend && npx prisma generate --schema=./prisma/schema.prisma || true

ENV NEXT_TELEMETRY_DISABLED="1"
ENV NODE_ENV="production"
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV PRISMA_SKIP_DATABASE_URL_VALIDATION="1"
ENV DB_OFFLINE="true"
ENV SKIP_ENV_VALIDATION="1"
ENV NEXTAUTH_SECRET="ci-build-placeholder-secret-32-chars-long"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXT_PUBLIC_APP_URL="https://kcmchurch.vercel.app"
ENV NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="placeholder"
ENV NEXT_PUBLIC_FIREBASE_API_KEY="placeholder"
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="placeholder.firebaseapp.com"
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID="placeholder"
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="placeholder.appspot.com"
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="000000000000"
ENV NEXT_PUBLIC_FIREBASE_APP_ID="1:000000000000:web:placeholder"
ENV NEXT_PUBLIC_FIREBASE_VAPID_KEY="placeholder"
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the Next.js frontend
RUN npm run build -w frontend

# ── Stage 3: Minimal Production Runner ────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV="production"
ENV NEXT_TELEMETRY_DISABLED="1"

# Expose Next.js server port
ENV PORT="3000"
ENV HOSTNAME="0.0.0.0"

# Setup secure, non-root user execution context
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static public folders
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public

# Leverage Next.js standalone tracing output
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health/live || exit 1

# In a monorepo, standalone output is placed under the package path
CMD ["node", "frontend/server.js"]
