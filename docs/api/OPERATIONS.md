# KCM Backend API Operations & Observability Runbook

## 1. Health Probe Specifications

| Endpoint | Purpose | Target Response Time | Success Criteria |
| :--- | :--- | :--- | :--- |
| `GET /api/live` | Kubernetes Liveness Probe | < 20ms | Node process responsive (`HTTP 200 { status: "live" }`) |
| `GET /api/ready` | Kubernetes Readiness Probe | < 100ms | PostgreSQL pool connected (`HTTP 200 { status: "ready" }`) |
| `GET /api/health`| Comprehensive Health Report | < 500ms | All 11 health subsystems passing |

## 2. Graceful Shutdown Sequence
Upon receiving `SIGTERM` / `SIGINT`:
1. Stop accepting new inbound HTTP requests.
2. Allow active inflight requests 25 seconds to complete.
3. Pause background BullMQ queue consumers.
4. Disconnect active Socket.io sessions.
5. Close Redis clients cleanly.
6. Call `prisma.$disconnect()` to drain PostgreSQL connection pool.
7. Terminate process with Exit code 0.
