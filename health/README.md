# Kingdom of Christ Ministries (KCM) — Centralized Platform Health System

A centralized, production-grade application diagnostics and health inspection subsystem for the Kingdom of Christ Ministries web application and companion services.

---

## 1. Overview & Architecture

All health checks, diagnostic scanners, telemetry inspectors, and report generators are isolated under the `health/` directory. The architecture follows strict **Object-Oriented Programming (OOP)** and **SOLID** design principles.

```
health/
├── config/              # Centralized thresholds, timeouts, and types
│   ├── health.config.ts # Performance targets & security rules
│   └── health.types.ts  # Interfaces, Enums, Context definitions
├── core/                # Core engine, check contracts, and registry
│   ├── HealthStatus.ts  # PASS, WARN, FAIL, SKIPPED, UNKNOWN
│   ├── HealthResult.ts  # Result value object with secret masking
│   ├── HealthCheck.ts   # BaseHealthCheck abstract class
│   ├── HealthRegistry.ts# Check catalog & dependency injection
│   ├── HealthReport.ts  # Aggregate report data model
│   ├── HealthEngine.ts  # Execution runner with controlled concurrency
│   └── registerAllChecks.ts # Dynamic check loader
├── frontend/            # 11 Frontend checks (Routes, Bundles, A11y, SEO, etc.)
├── backend/             # 6 Backend checks (API, Express, Middleware, Errors)
├── auth/                # 5 Auth checks (Bcrypt, Sessions, OAuth, Roles, RBAC)
├── database/            # 7 Database checks (Postgres, Prisma, MongoDB, Redis, Pools)
├── security/            # 10 Security checks (Secrets, Headers, CORS, CSRF, IDOR)
├── integrations/        # 6 Integrations checks (Cloudinary, Google, Firebase, Razorpay)
├── infrastructure/      # 6 Infra checks (Docker, Kubernetes, Helm, CI/CD, TLS)
├── observability/       # 4 Observability checks (Logging, Metrics, Tracing, Probes)
├── testing/             # 5 Testing checks (Unit, Integration, E2E, Regression)
├── performance/         # 5 Performance checks (Core Web Vitals, Database, APIs)
├── reports/             # Multi-format report generators (JSON, HTML, Markdown)
└── cli/                 # Command-line interface runner
```

---

## 2. CLI Usage

Run the health engine across all categories or targeted domains:

```bash
# Run full diagnostic suite
npm run health

# Target specific domains
npm run health:frontend
npm run health:backend
npm run health:security
npm run health:database
npm run health:auth
npm run health:performance
npm run health:infrastructure

# Advanced flags
npx tsx health/cli/health.ts --category=security --severity=HIGH
npx tsx health/cli/health.ts --autofix
```

---

## 3. Core Status & Severity Model

Every health check evaluates to one of 5 statuses:
- **PASS**: Meets or exceeds operational and security specifications.
- **WARN**: Operational but deviates from recommended standards or optimization targets.
- **FAIL**: Immediate defect or missing architectural requirement.
- **SKIPPED**: Check not applicable for current environment (e.g. optional cluster addon).
- **UNKNOWN**: Status undetermined due to external dependency unavailability.

Severities:
- `CRITICAL` (Immediate blocker / security vulnerability)
- `HIGH`
- `MEDIUM`
- `LOW`
- `INFO`

---

## 4. Zero Secret Exposure Guarantee

All diagnostic outputs, CLI logs, JSON reports, and HTML files pass through `HealthResult.maskSecrets()`. Database passwords, secret tokens, private keys, and API credentials are automatically masked into `[REDACTED_*]` tokens before serialization.

---

## 5. Adding New Health Checks

Extend `BaseHealthCheck` and register your class:

```typescript
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class CustomFeatureHealthCheck extends BaseHealthCheck {
  public readonly name = "Custom Feature Integrity";
  public readonly category: HealthCategoryType = "frontend";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    // Your inspection logic here
    return HealthResult.pass(this.name, this.category, "Custom feature operational.");
  }
}
```
