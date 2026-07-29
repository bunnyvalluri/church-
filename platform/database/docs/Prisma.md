# Prisma ORM CloudNativePG Integration Guide

## Connection Strings & Strategy
Prisma client interacts with CloudNativePG via PgBouncer transaction connection poolers.

### Environment Variables
- `DATABASE_URL`: `postgresql://kcm_app_user:PASSWORD@kcm-db-pooler-rw.kcm-database.svc.cluster.local:5432/kcm_portal_db?schema=public&pgbouncer=true`
- `RO_DATABASE_URL`: `postgresql://kcm_app_user:PASSWORD@kcm-db-pooler-ro.kcm-database.svc.cluster.local:5432/kcm_portal_db?schema=public&pgbouncer=true`

## Database Migrations Workflow
Migrations MUST be run directly against the primary instance (or via session pooler) using `prisma migrate deploy` during CI/CD steps.

```bash
# Run migrations in CI/CD pipeline
npx prisma migrate deploy --schema=database/schema.prisma
```
