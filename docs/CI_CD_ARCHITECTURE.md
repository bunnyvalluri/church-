# CI/CD Pipeline Architecture & Quality Gates

## 1. System Overview

The Kingdom of Christ Ministries platform implements a deterministic, multi-tiered deployment lifecycle that integrates automated code quality verification, security gates, immutable release stamping, staging health verification, progressive observation, and automated anomaly rollback.

```
┌─────────────────────────────────────────────────────────────┐
│                      SOURCE CODE EVENT                      │
│                  Git Push / Pull Request                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 1. INSTALL & DEPENDENCY GATE                │
│    • Least-privilege token (permissions: contents: read)    │
│    • Authoritative lockfile enforcement (npm ci)            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 2. STATIC QUALITY & PARITY                  │
│    • Multilingual dictionary key parity (npm run i18n:check)│
│    • Strict ESLint code quality gate (npm run lint)         │
│    • TypeScript compile verification (npm run typecheck)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 3. AUTOMATED SECURITY GATES                 │
│    • Secret scanning & credential detection                 │
│    • Dependency vulnerability audit                         │
│    • Static Application Security Testing (SAST)             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             4. BUILD & IMMUTABLE RELEASE STAMPING           │
│    • Node.js / Next.js production compilation               │
│    • Immutable commit SHA & build ID injection              │
│    • Self-healing build recovery (build:recover)            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               5. STAGING DEPLOYMENT & HEALTH                │
│    • Staging preview environment deploy                     │
│    • Multi-probe health checks (/health, /live, /ready)     │
│    • Smoke test execution                                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              6. PRODUCTION DEPLOYMENT & OBSERVATION         │
│    • Zero-downtime serverless promotion / Argo Rollout      │
│    • Post-deployment health monitoring (health:monitor)     │
│    • 30s observation window with anomaly detection          │
└──────────────────────────────┬──────────────────────────────┘
                               │
             ┌─────────────────┴─────────────────┐
             │                                   │
      [Stable Health]                     [Anomaly Detected]
             │                                   │
             ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│  7. SUCCESS & METRICS   │         │  8. AUTOMATED ROLLBACK  │
│  • Tag release healthy  │         │  • Restore last release │
│  • Operator alert info  │         │  • Incident report generated
└─────────────────────────┘         └─────────────────────────┘
```

---

## 2. Immutable Deployment Metadata

Every release injected into production contains deterministic, non-sensitive traceability headers exposed via `GET /api/health/version`:
- `gitCommitSha`: 40-character Git commit hash
- `deploymentId`: Unique deployment identifier
- `appVersion`: Semantic version (`1.0.0`)
- `environment`: `production` / `staging`
- `buildTimestamp`: ISO-8601 compilation timestamp
- `immutableRelease`: `true`
