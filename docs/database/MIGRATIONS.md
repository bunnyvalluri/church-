# KCM Database Migration Safety & Lifecycle Management

## 1. Migration Strategy (Expand & Contract)
For all schema evolutions on production databases, the **Expand-and-Contract (Two-Phase)** migration pattern is strictly enforced:

```
Step 1: EXPAND
   ├── Add new nullable column or non-breaking table
   ├── Deploy application supporting both old and new schemas
   └── Backfill data asynchronously in batches

Step 2: VERIFY
   ├── Validate application metrics and query latency
   └── Confirm 100% of data reads/writes target the new structure

Step 3: CONTRACT
   ├── Add NOT NULL constraints or remove deprecated columns
   └── Drop old indexes/tables safely
```

## 2. Safety Guidelines for Production Migrations
1. **Zero Table Locks**:
   - Never add `NOT NULL` columns without a safe default value.
   - Use `CREATE INDEX CONCURRENTLY` in PostgreSQL for index additions on large tables.
2. **Deterministic Seed Guard**:
   - Seed scripts ([`frontend/prisma/seed.js`](file:///c:/K.C.M-Portal/frontend/prisma/seed.js)) inspect `NODE_ENV`. If `NODE_ENV=production`, mock demo data creation is blocked automatically.
3. **Rollback Procedures**:
   - Every migration must have a paired down-migration or revert script tested in staging before execution against production Neon instances.
