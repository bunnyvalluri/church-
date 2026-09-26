# KCM Portal — Backend & API Architecture Specification

## 1. Overview & Process Topology

The backend services operate as high-performance, modular Node.js processes configured to run in single-container mode (development) or partitioned Kubernetes deployments (production):
- **API Server (`api.js` / Next.js Route Handlers)**: Processes REST APIs, webhook ingestion, and user authentication.
- **Socket Server (`socket.js`)**: Manages real-time WebSockets with room-based pub/sub for branch pastors and active browsers.
- **Worker Process (`worker.js`)**: Consumes BullMQ asynchronous queues (`eventUploadQueue`, `notificationQueue`, `donationQueue`).
- **Cron Process (`cron.js`)**: Schedules periodic OODA health audits, compliance calculations, and branch report reminders.

---

## 2. API Contract & Response Standards

All API endpoints strictly follow the contract standardized in [`frontend/lib/apiResponse.ts`](file:///c:/K.C.M-Portal/frontend/lib/apiResponse.ts):

### Standard Success DTO
```json
{
  "success": true,
  "data": { ... }
}
```

### Standard Error DTO
```json
{
  "success": false,
  "error": "Human readable error explanation",
  "details": { ... } // Optional structured validation details
}
```

### Standard Paginated DTO
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 120,
    "page": 1,
    "pageSize": 20,
    "totalPages": 6
  }
}
```
