# MongoDB Atlas Security Architecture & Hardening Guide

## Purpose
This document specifies the security architecture, network isolation, least-privilege role-based access control, connection pooling standards, and credential rotation procedures for MongoDB Atlas across the Kingdom of Christ Ministries platform.

## Scope
Covers MongoDB connection clients (`frontend/lib/mongodb/client.ts`, `backend/server.js`), document schemas, TTL indexing, Atlas network access lists, and DevSecOps rotation protocols.

## Status
> Status: Implemented & Enforced

---

## 1. MongoDB Atlas Security Architecture

```mermaid
graph TD
    subgraph Client Tier
        Browser[Public Browser / Mobile PWA]
        MaliciousActor[External Attacker]
    end

    subgraph Security Boundary - Server-Side Only
        NextJSServer[Next.js Server API Routes / Server Actions]
        ExpressBackend[Companion Express / Socket.io Engine]
    end

    subgraph MongoDB Atlas Cloud
        AtlasFirewall[Atlas Network Access List / VPC Peering]
        MongoCluster[(MongoDB Atlas Replica Set: kcm_church)]
    end

    Browser -->|HTTPS API Requests / Session Cookie| NextJSServer
    Browser -->|WSS Socket Connection| ExpressBackend
    MaliciousActor -.->|DIRECT ACCESS BLOCKED (No Client URI)| MongoCluster

    NextJSServer -->|TLS 1.3 + SCRAM-SHA-256 (MONGODB_URI)| AtlasFirewall
    ExpressBackend -->|TLS 1.3 + SCRAM-SHA-256 (MONGODB_URI)| AtlasFirewall
    AtlasFirewall --> MongoCluster
```

---

## 2. Server-Side Execution & Zero Client-Side Exposure

1. **No Browser Exposure**: MongoDB connection logic is strictly confined to server-side Node.js runtimes (`frontend/lib/mongodb/`).
2. **No Client Bundling**: Webpack and Next.js bundle tracing ensure that `process.env.MONGODB_URI` is never referenced in client components (`'use client'`) and is completely omitted from browser JavaScript bundles.
3. **API Boundary**: All database operations (audit logging, notification history, system telemetry) are exposed to clients exclusively via authenticated, rate-limited REST route handlers (`/api/admin/*`).

---

## 3. Connection Pooling & Resource Management

Configured in `frontend/lib/mongodb/client.ts`:

- **Singleton Pattern**: In development, the `MongoClient` instance is preserved on `globalThis` to prevent connection leaks across hot-module reloads.
- **Connection Pool Bounds**:
  - `minPoolSize`: `5` (Pre-warmed connections for low-latency queries).
  - `maxPoolSize`: `50` in production; `10` in development.
- **Resilient Timeouts**:
  - `connectTimeoutMS`: `10,000` (10 seconds).
  - `serverSelectionTimeoutMS`: `5,000` (5 seconds).
  - `socketTimeoutMS`: `45,000` (45 seconds).
- **Graceful Teardown**: Hooks into Node.js `beforeExit` lifecycle events to cleanly flush and terminate connections before container eviction.

---

## 4. Least-Privilege Role & Database User Management

The application must never connect using an Atlas administrative account (`atlasAdmin` or `root`).

### Production Application User Configuration:
- **Username**: `kcm_app_user`
- **Authentication Database**: `admin`
- **Database Roles**:
  - `readWrite` on `kcm_church` database ONLY.
  - `read` on `system.views` for index discovery.
- **Restrictions**: User cannot create new databases, modify cluster topology, or access billing metadata.

---

## 5. Network Access List & Isolation

1. **Kubernetes Cluster Egress**: MongoDB Atlas IP Access List is configured with the static outbound Elastic IP addresses of the Kubernetes NAT Gateway.
2. **Vercel Serverless Function Egress**: Vercel dynamic IP ranges require either Vercel Secure Integration / AWS PrivateLink or restricted CIDR ranges. If temporary `0.0.0.0/0` access is enabled in development, it is strictly compensated by:
   - Strong 32-character randomized passwords.
   - Strict SCRAM-SHA-256 authentication.
   - TLS 1.3 mandatory encryption (`ssl=true`).
   - Least-privilege database user scoping.

---

## 6. Safe Configuration Reference

In all configuration files and documentation, placeholders must be used:

```dotenv
# MongoDB Atlas Canonical Connection String (Server-Side Only)
MONGODB_URI="mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>/<DATABASE>?retryWrites=true&w=majority"
MONGODB_DATABASE_NAME="kcm_church"
MONGODB_OFFLINE="false"
```

---

## 7. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| `MongoServerSelectionError: connection timed out` | Outbound IP not in Atlas IP Access List | Add client IP to MongoDB Atlas Network Access security list or enable offline mode (`MONGODB_OFFLINE="true"`). |
| `MongoTopologyClosedError` | Attempting to query database after client has closed | Use the managed `getMongoDb()` singleton method instead of caching raw database handles. |
| Connection pool exhaustion in logs | High concurrency without connection limits | Ensure `maxPoolSize` is configured and queries use streaming cursors for large datasets. |

---

## Security Considerations
- Rotate the exposed MongoDB credential before considering any security incident resolved.
- Connection strings must never be logged, printed, or returned in API error responses.

## Related Documentation
- [Secrets-Management.md](Secrets-Management.md) — Credential rotation workflows.
- [MongoDB-Atlas.md](MongoDB-Atlas.md) — Document schemas and TTL indexes.
- [Security.md](Security.md) — Platform-wide security architecture.
