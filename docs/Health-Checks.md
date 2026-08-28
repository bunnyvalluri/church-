# Health Check Probes & Service Readiness Specification

## Purpose
This document provides the technical specification for service health probes, readiness checks, liveness probes, and detailed administrative diagnostic endpoints across the Kingdom of Christ Ministries platform.

## Scope
Covers `/api/health`, `/api/ready`, `/api/live`, `/api/admin/health/detailed`, and Kubernetes pod probe configurations.

## Status
> Status: Implemented

---

## 1. Health Probe Endpoints Catalog

| Endpoint | Probe Type | Primary Target | Checks Performed | Success Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/health` | **Liveness / Startup** | Next.js & Express | Process is running and responding to HTTP event loops | `200 OK` |
| `GET /api/live` | **Liveness** | Kubernetes Controller | Minimal heartbeat probe without downstream dependency checks | `200 OK` |
| `GET /api/ready` | **Readiness** | Envoy Gateway | Validates PostgreSQL and Redis connection pool connectivity | `200 OK` |
| `GET /api/admin/health/detailed`| **Diagnostic** | Admin Dashboard | Deep inspection of Postgres, Mongo, Redis, Cloudinary, Firebase, SMS | `200 OK` |

---

## 2. Kubernetes Pod Probe Configurations

Configured in `k8s/frontend.yaml` and `k8s/backend-api.yaml`:

```yaml
startupProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 30 # Allows up to 150s for initial bundle compilation & DB warm-up

readinessProbe:
  httpGet:
    path: /api/ready
    port: 3000
  periodSeconds: 5
  failureThreshold: 2 # Takes pod out of load balancer within 10s of database outage

livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  periodSeconds: 10
  failureThreshold: 3 # Restarts deadlocked Node.js processes after 30s
```

---

## 3. Subsystem Health Verification Logic (`/api/ready`)

```typescript
export async function GET() {
  try {
    // 1. PostgreSQL check via lightweight query
    await prisma.$queryRaw`SELECT 1`;
    
    // 2. Return 200 OK if all critical operational dependencies are reachable
    return NextResponse.json({
      ready: true,
      database: "connected",
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      ready: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
```

---

## 4. Degraded vs Fatal State Handling

- **Degraded State (Non-Fatal)**: If secondary services (e.g. MongoDB logging or Cloudinary upload) fail, `/api/ready` remains **healthy (200 OK)** to keep public sermon and event reading available.
- **Fatal State**: If PostgreSQL master is unreachable, `/api/ready` returns **503 Service Unavailable**, causing Envoy Gateway to reroute requests to healthy standby pods.

---

## 5. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Pod gets stuck in `Unhealthy` readiness state during startup | Readiness probe fired before Prisma database connection pool established | Use `startupProbe` with higher `failureThreshold` to delay readiness checks until initialization completes. |
| Readiness probe causes high database CPU utilization | Probe executing expensive queries (e.g. `COUNT(*)`) | Ensure probe executes only `SELECT 1` or cached ping statements. |

---

## Security Considerations
- Public probes (`/api/health`, `/api/ready`) expose zero internal system paths, connection strings, or database versions.
- Detailed diagnostic endpoints (`/api/admin/health/detailed`) require authenticated `ADMIN` session privileges.

## Related Documentation
- [Kubernetes.md](Kubernetes.md) — Pod deployment manifests.
- [Monitoring.md](Monitoring.md) — Prometheus health metrics.
- [Admin-Portal.md](Admin-Portal.md) — Health monitor UI.
