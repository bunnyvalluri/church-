# Database Observability & Logging Standard

## CloudNativePG & PostgreSQL Integration
- **Stdout Engine Logs**: CloudNativePG outputs PostgreSQL logs to pod stdout in structured CSV / JSON formats.
- **Prisma ORM Instrumentation**: Application-level Prisma queries exceeding `SLOW_QUERY_THRESHOLD_MS` (default 200ms) emit `category: DATABASE` log messages with target table, parameters, and duration.
- **PgBouncer & Backups**: Connection pool errors and CNPG barman backup/restore logs are tagged with `app: cnpg-operator`.
