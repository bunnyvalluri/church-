# KCM Platform — Realtime & WebSocket System

---

## 1. Socket Architecture

- **Engine**: Socket.IO v4 running on companion Express server (`backend/server.js`).
- **Client**: `frontend/lib/socketClient.ts` with circuit-breaker protection:
  - Disallows insecure `ws://localhost` attempts in production HTTPS.
  - Caps reconnection attempts at 3 to prevent browser resource exhaustion.
  - Automatically falls back to silent idle state if companion backend is offline.

---

## 2. Event Channels & Rooms

- `events`: Public broadcast channel for new live events and notifications.
- `member:<uid>`: Authenticated member channel for personal receipts, prayer updates.
- `admin`: Privileged room for staff real-time activity and security alerts.
