# KCM Church — Frontend Deployment & Operational Playbook

**Target Environments**: Vercel Edge Network (Primary PWA) • Docker / Kubernetes (Containerized Standalone)

---

## 1. Production Build Pipeline

```bash
# Clean production build
npm run build -w frontend
```

The build executes three sequential steps:
1. `npx prisma generate` (compiles database client)
2. `node scripts/generate-image-sitemap.js` (generates image sitemaps)
3. `next build` (compiles Next.js App Router application with standalone output)

---

## 2. Docker Containerization

The frontend is containerized using a multi-stage Dockerfile:
1. `deps`: Resolves dependencies with `npm ci --ignore-scripts`.
2. `builder`: Generates Prisma and compiles Next.js standalone application.
3. `runner`: Secure non-root Alpine container exposing port 3000.

---

## 3. Rollback Procedure
If a regression occurs in production:
1. Vercel: Instant rollback to previous deployment SHA via Vercel Dashboard or CLI (`vercel rollback`).
2. Kubernetes: `kubectl rollout undo deployment/kcm-frontend -n kcm-system`.

