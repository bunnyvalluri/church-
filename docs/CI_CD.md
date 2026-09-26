# CI/CD Pipeline Architecture

## Pipeline Overview

The KCM platform utilizes GitHub Actions for continuous quality, security, and deployment automation.

```
Pull Request / Branch Push
          │
          ▼
┌───────────────────────────────────────┐
│ 1. Least-Privilege Checkout (Read-Only)│
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

## Security Hardening
- **Strict Error Handling**: `continue-on-error: true` is strictly prohibited on mandatory quality and security checks.
- **Least Privilege Tokens**: Workflows declare explicit top-level `permissions: contents: read`.
- **Zero Hardcoded Secrets**: Secrets are injected dynamically through GitHub Actions repository secrets.
