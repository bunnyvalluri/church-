# KCM Platform — Test Automation & Quality Assurance

---

## 1. Testing Pyramid Structure

```
                  ┌───────────────┐
                  │   E2E Tests   │  Playwright (Cross-browser, Mobile viewport,
                  │  (Smoke/User) │  theme, accessibility, routes)
                  └───────┬───────┘
                          │
                  ┌───────▼───────┐
                  │  Integration  │  Database verification, API endpoints,
                  │     Tests     │  payment webhooks, socket events
                  └───────┬───────┘
                          │
                  ┌───────▼───────┐
                  │  Unit Tests   │  Validators, security redactor,
                  │  & Diagnostics│  crypto edge sessions, 65 Health Checks
                  └───────────────┘
```

---

## 2. Test Execution Commands

```bash
# 1. Typecheck (Zero Error Tolerance)
npm run typecheck -w frontend

# 2. ESLint Analysis
npm run lint -w frontend

# 3. Platform Health Diagnostic Suite (65 Checks)
npx tsx health/cli/health.ts

# 4. Live Database Verification
npm run db:check -w backend

# 5. Playwright Smoke Tests
npx playwright test tests/smoke/production-smoke.spec.ts -c frontend/playwright.config.ts

# 6. Quality Engineering Autonomous Agent
npm run agent:audit
```
