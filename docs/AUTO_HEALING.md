# Auto-Healing & Infrastructure Self-Recovery Specification

## 1. Overview
The KCM auto-healing system provides bounded, deterministic recovery from transient infrastructure, build, and runtime anomalies without manual operator intervention.

---

## 2. Auto-Healing Layers

| Layer | Trigger Condition | Healing Action | Boundary & Safety Limits |
| :--- | :--- | :--- | :--- |
| **Build Time** | Missing Prisma client / transient npm registry timeout | Executes `scripts/deployment/build-failure-recovery.js` to run `npx prisma generate` or apply exponential backoff | Capped at 2 retries. Deterministic type/lint errors immediately halt the pipeline. |
| **Edge / Runtime** | Companion WebSocket offline in production | Client-side circuit breaker in `socketClient.ts` falls back to silent idle state | Capped at 3 reconnection attempts to prevent browser thread saturation. |
| **Service Worker** | Unsupported scheme (e.g. `chrome-extension://`) | `sw.js` (v6) filters request schemes and passes them directly to native browser handling | Caches only HTTP/HTTPS requests with 200 OK responses. |
| **Post-Deploy Probing** | Single transient network timeout during probe cycle | `auto-healing-monitor.js` applies poll-interval retry before declaring failure | Requires 3 consecutive anomalous cycles before triggering rollback. |
| **Container / Pod (K8s)** | Pod crash / liveness probe failure | Kubernetes kubelet restarts pod with exponential backoff (`restartPolicy: Always`) | Bounded by PodDisruptionBudgets and readiness gates. |

---

## 3. Rollback Lock & Anti-Loop Protection
To prevent thrashing cycles (`Deploy → Fail → Rollback → Deploy → Fail`):
- Persistent lock state tracked in `.deployment-rollback-lock.json`.
- `MAX_AUTOMATIC_ROLLBACKS = 2`.
- When exceeded, automated promotions are halted, an incident record is logged, and manual operator review is mandated.
