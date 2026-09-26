# Continuous Integration & Delivery Specification

## Overview
This document outlines the automated CI/CD pipeline running via GitHub Actions for the KCM Church platform monorepo.

---

## 1. Pipeline Stages

```
GitHub Push / Pull Request
            │
            ▼
┌───────────────────────────────────────┐
│ 1. Checkout (permissions: read-only)  │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│ 2. Install Monorepo Dependencies (npm ci)
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│ 3. Multilingual Key Parity (i18n:check)│
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│ 4. Prisma Client Compilation          │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│ 5. Strict ESLint Code Quality Gate    │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│ 6. Next.js Production Build           │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│ 7. Deploy Preview / Production (Vercel)│
└───────────────────────────────────────┘
```

---

## 2. Enforcement Gates
- **Zero Permissive Overrides**: `continue-on-error: true` is prohibited on mandatory lint, typecheck, translation, or test gates.
- **Least Privilege Tokens**: Workflows declare explicit `permissions: contents: read`.
- **Pre-deployment Verification**: Next.js builds must complete successfully without unhandled errors.
