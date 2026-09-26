# KCM Portal — Realtime & Socket.io Architecture

## 1. WebSocket Infrastructure & Room Routing

The real-time layer leverages **Socket.io** backed by Redis Adapter for horizontal scalability:
- **Default Namespace (`/`)**: Connects web browsers, mobile PWA clients, and admin dashboards.
- **Room Topology**:
  - `branch:<branch_id>`: Broadcasts branch-specific updates (announcements, attendance counts).
  - `admin:all`: Delivers live security audits, system alerts, and financial goal increments.
  - `user:<user_id>`: Direct user notifications (prayer request status, receipt generation).

---

## 2. Event Contract Specification

| Event Name | Direction | Payload Structure | Triggering Event |
| :--- | :--- | :--- | :--- |
| `event:new` | Server -> Client | `{ id, title, branchId, date, posterUrl }` | New church event created |
| `sermon:uploaded` | Server -> Client | `{ id, title, pastor, youtubeUrl }` | New sermon video processed |
| `donation:received` | Server -> Admin | `{ amount, purpose, branchId, timestamp }` | Razorpay webhook committed |
| `branch:alert` | Server -> Pastor | `{ branchId, complianceScore, message }` | Compliance loop anomaly |
