# NATS Troubleshooting & Diagnostic Guide

## Common Operational Issues & Diagnostic Solutions

### 1. Connection Refused (`nats: v8 connection closed / unreachable`)
- **Root Cause**: Pod DNS resolution failure or TLS certificate mismatch.
- **Diagnostic Command**:
  ```bash
  kubectl get pods -n messaging
  kubectl describe pod nats-0 -n messaging
  ```
- **Fix**: Verify `nats-server-tls` secret validity and ensure client application connects via TLS with CA trust store.

### 2. Slow Consumer Disconnection Errors (`ERR 'Slow Consumer'`)
- **Root Cause**: Consumer buffer overflow when publishing faster than client socket reading rate.
- **Fix**: Convert ephemeral pub/sub to JetStream WorkQueue durable consumer so messages are stored on disk.

### 3. JetStream Memory or Disk Limits Reached (`ErrNoMem` / `ErrNoDisk`)
- **Fix**: Purge expired stream subjects or execute storage expansion runbook (`storage-expansion.md`).
