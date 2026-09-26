# KCM Backend & API Architecture Specification

## 1. System Ingress & Layer Separation
The KCM Church backend architecture is structured around clean domain boundaries with strict separation of concerns across request ingress, authentication, validation, domain services, and database persistence:

```
[Client / PWA / Browser]
           |
           v
+---------------------------------------------------------+
|                Ingress / Edge Middleware                |
|      (CORS, Security Headers, Rate Limiting, RBAC)      |
+---------------------------------------------------------+
           |
           v
+---------------------------------------------------------+
|            Route Handlers / API Controllers             |
|   (Next.js 14 App Router /api/* + Express Server)       |
+---------------------------------------------------------+
           |
           v
+---------------------------------------------------------+
|                     Domain Services                     |
| (Auth, Email, Payments, AI Agent, SMS, Notifications)   |
+---------------------------------------------------------+
           |
           v
+---------------------------------------------------------+
|              Data Access Layer / Prisma ORM             |
|   (Interactive Transactions, Connection Pooling, Neon)  |
+---------------------------------------------------------+
           |
           +-----------------------+-----------------------+
           |                       |                       |
           v                       v                       v
    [PostgreSQL/Neon]       [Upstash Redis]         [Cloudinary]
```

## 2. API Contract Standard
All backend REST endpoints return a deterministic JSON envelope:

### Success Response:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142
  },
  "requestId": "req_01hx..."
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested entity does not exist."
  },
  "requestId": "req_01hx..."
}
```
Production error responses strictly sanitize internal SQL, Prisma internals, or stack traces.
