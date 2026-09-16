# KCM Platform — CI/CD Pipeline & Quality Gates

---

## 1. Quality Gate Architecture (`.github/workflows/ci.yml`)

Every pull request and push to `main` must pass 11 automated verification checks before deployment:

1. **Dependency Installation**: `npm ci --prefer-offline`
2. **Dependency Audit**: `npm audit --audit-level=critical`
3. **Prisma Generation**: Regenerates ORM clients for frontend and backend.
4. **Static Typecheck**: `npm run typecheck -w frontend` (Strict zero error policy).
5. **Code Style & Lint**: `npm run lint -w frontend`.
6. **Security & Secret Scan**: `npx tsx health/cli/health.ts --category=security --severity=CRITICAL`.
7. **Unit & Contract Verification**: Runs verification on centralized modules.
8. **Production Build**: `npm run build` compiles full Next.js application bundle.
9. **Bundle Budget Inspection**: `node scripts/scan_production_bundle.js`.

---

## 2. Failure Policy

If any step fails: **DEPLOYMENT IS BLOCKED IMMEDIATELY**.
