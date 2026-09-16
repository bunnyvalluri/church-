# KCM Platform — Deployment Architecture & Runbook

---

## 1. Multi-Target Deployment

- **Vercel Edge Platform**: Houses Next.js 14 frontend, API routes, edge middleware, and static assets.
- **Docker / Kubernetes (`k8s/`)**: Houses companion Express server, background BullMQ queues, and realtime Socket.IO cluster.

---

## 2. Pre-Deployment Verification Checklist

- [x] Run `npm run typecheck -w frontend`
- [x] Run `npm run lint -w frontend`
- [x] Run `npx tsx health/cli/health.ts` (Ensure 0 critical failures)
- [x] Verify Neon database connectivity (`npm run db:check -w backend`)
- [x] Confirm environment secrets are set in deployment target
