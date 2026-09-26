# Build Failure Recovery & Autonomous Diagnostics

## 1. Failure Taxonomy & Classification Matrix

| Error Category | Transient? | Auto-Recovery Action | Behavior |
| :--- | :--- | :--- | :--- |
| `PRISMA_CLIENT_GENERATION_MISSING` | **Yes** | Executes `npm run postinstall` | Automatically regenerates Prisma client and retries compilation. |
| `TRANSIENT_NETWORK_TIMEOUT` | **Yes** | Exponential backoff (1s, 2s, 4s) | Retries build step up to 2 times. |
| `TYPESCRIPT_TYPE_MISMATCH` | **No** | None (Halts pipeline) | Generates structured diagnostic artifact with offending file and line. |
| `ESLINT_RULE_VIOLATION` | **No** | None (Halts pipeline) | Requires code modification per quality standards. |
| `I18N_DICTIONARY_DESYNC` | **No** | None (Halts pipeline) | Reports missing translation key pairs across EN, TE, HI. |

---

## 2. Diagnostic Artifacts
All build failures produce a JSON report at `reports/build-failure-report.json` containing:
- Failure category
- Timestamp
- Attempt count
- Actionable developer recommendations
