# ADR-003: Neon PostgreSQL Relational Ownership with PgBouncer Connection Pooling

## Status
`ACCEPTED`

## Context
KCM needs transactional integrity for financial donations, member profiles, event tickets, and church ministry data, while maintaining low-latency serverless and containerized deployments.

## Decision
Designate Neon PostgreSQL as the primary relational source of truth via Prisma ORM:
- Enforce connection pooling via direct PgBouncer connection strings (`?sslmode=require&pgbouncer=true`).
- Utilize Prisma Client singleton pattern to prevent pool exhaustion across serverless lambdas and Kubernetes pods.
- Isolate unstructured security audit telemetry into MongoDB Atlas.

## Consequences
- **Positive**: Strict ACID transaction guarantees for donations, point-in-time recovery (PITR), protection against connection exhaustion.
- **Negative**: Requires strict migration validation before applying schema changes.
