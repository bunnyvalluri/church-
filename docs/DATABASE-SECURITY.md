# KCM Portal — Comprehensive Database Security & Hardening Specification

**Document Version:** 2.0.0  
**Security Classification:** Enterprise Hardened  
**Audit Date:** September 10, 2026  
**Primary Database:** Neon Serverless PostgreSQL  
**Telemetry Store:** MongoDB Atlas  
**ORM:** Prisma 5.11.0  

---

## 1. PostgreSQL Hardening & Safeguards

### 1.1 SQL Injection Elimination
- **100% Parameterized Queries:** All database operations utilize Prisma ORM client methods (`findUnique`, `findMany`, `create`, `update`, `delete`). Prisma automatically compiles queries into parameterized SQL with prepared statements, preventing SQL injection.
- **Raw Query Auditing:** All occurrences of `prisma.$queryRaw` in health check routes (`api/health`, `api/ready`) use tagged template literals (`prisma.$queryRaw`SELECT 1``). Zero dynamic string concatenation or string interpolation exists in raw SQL queries.

### 1.2 Transport & Connection Security
- **Mandatory TLS 1.3 / SSL:** The production `DATABASE_URL` enforces `sslmode=require`, ensuring all database traffic across Vercel and Neon is encrypted in transit.
- **Connection Pooling:** Traffic routes through the Neon PgBouncer connection pooler to prevent connection starvation and exhaustion attacks under high traffic load.

### 1.3 Schema Isolation & Least Privilege
- Schema mappings are explicitly declared (e.g. `@@map("pastors")`) to enforce predictable object resolution.
- Destructive commands (`DROP DATABASE`, `DROP TABLE`, `TRUNCATE`) are blocked by CI/CD quality gates and production database access controls.

---

## 2. MongoDB Security & Hardening

### 2.1 Access Boundaries
- MongoDB is strictly segregated for **append-only** telemetry, analytics, and activity logs.
- No authentication credentials, passwords, or primary relational entities are stored in MongoDB.
- MongoDB is never directly exposed to client browsers; all operations occur inside server-side repository classes.

### 2.2 NoSQL Injection Mitigation
- Queries are constructed using typed object literal selectors without arbitrary `$where` JavaScript evaluation.
- All dynamic identifier queries validate input types prior to executing collection operations.

---

## 3. Data Protection & Privacy

- **Data Minimization:** Sensitive member attributes (phone numbers, physical addresses, donation amounts) are restricted to authorized administrative sessions and filtered from public search endpoints.
- **Audit Trails:** Administrative modifications trigger automated audit entries in both PostgreSQL (`AuditLog`) and MongoDB (`audit_events`).
