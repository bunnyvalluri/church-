# KCM Portal — Realtime & WebSocket Security Specification

**Document Version:** 2.0.0  
**Security Classification:** Enterprise Hardened  
**Audit Date:** September 10, 2026  
**Technologies:** Socket.IO v4, Redis Adapter, Next.js Edge  

---

## 1. Realtime Security Architecture

The KCM realtime infrastructure decouples browser clients from backend daemon infrastructure:

```text
[ Browser Client ]
        │
   (HTTPS / WSS)
        │
  Is NEXT_PUBLIC_SOCKET_URL set?
        ├── NO  ──► Return Safe Mock Socket (Zero Network Calls, Zero Localhost Leaks)
        └── YES ──► Connect via WSS to Authorized Companion Gateway
                          │
                   (Origin Whitelist & JWT Token Auth)
                          ▼
             [ Socket.IO Companion Server ]
                          │
                   (Redis Adapter)
                          ▼
             [ Upstash Redis Pub/Sub ]
```

---

## 2. Hardening Measures Implemented

### 2.1 Complete Localhost Leakage Elimination
- Previously, production clients on `https://kcmchurch.vercel.app` defaulted to `ws://localhost:3001`, triggering mixed-content security blocks and connection refusal loops.
- `frontend/lib/agentReachClient.ts` detects production HTTPS execution. If no valid remote secure URL is provided, it instantiates a resilient in-memory mock socket (`on`, `off`, `emit` no-ops) preventing connection attempts to `localhost`.

### 2.2 Origin Verification & CORS on Companion Server
In `backend/server.js`:
- The Socket.IO server verifies connection origins against an explicit whitelist (`https://kcmchurch.vercel.app`, `https://*.kcmchurch.org`).
- Connections from unauthorized origins are rejected at the handshake phase.

### 2.3 Rate Limiting & Message Size Controls
- Socket messages are capped at 100KB per payload.
- Connection throttling prevents socket flooding and resource exhaustion on background worker processes.
