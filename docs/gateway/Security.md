# Security — KCM Church Gateway Platform

## Security Layers

```
Internet Request
    │
    ▼
ClientTrafficPolicy  ← TLS 1.2+, cipher selection, connection limits
    │
    ▼
SecurityPolicy (CORS) ← Origin validation, preflight handling
    │
    ▼
SecurityPolicy (JWT)  ← Firebase token verification via JWKS
    │
    ▼
NetworkPolicy        ← Pod-to-pod traffic restriction
    │
    ▼
Application          ← Role-based access control
```

## Firebase JWT Authentication

JWT validation is performed by Envoy Gateway at the proxy layer — before the request reaches your Node.js backend.

**JWKS URL:** `https://www.googleapis.com/robot/v1/metadata/jwk/securetoken@system.gserviceaccount.com`

**Claims forwarded as headers:**
| Claim | Header |
|---|---|
| `sub` | `X-User-ID` |
| `email` | `X-User-Email` |
| `email_verified` | `X-Email-Verified` |
| `custom:role` | `X-User-Role` |

**Protected Routes:**
- `/admin/*` — requires valid Firebase JWT
- `/pastor/*` — requires valid Firebase JWT
- `/member/*` — requires valid Firebase JWT
- `/ngo/*` — requires valid Firebase JWT
- `/api/*` (except `/api/health`, `/api/webhooks`) — requires valid Firebase JWT

**Public Routes:**
- `/health`, `/healthz`, `/readyz` — no auth
- `/api/health` — no auth
- `/api/webhooks/*` — no auth (HMAC-verified by app)
- `/_next/static/*` — no auth

## CORS Policy

Allowed origins: `kcmchurch.org`, `www.kcmchurch.org`, `admin.kcmchurch.org`, `pastor.kcmchurch.org`, `member.kcmchurch.org`, `ngo.kcmchurch.org`

## Rate Limiting

| Client Type | Limit |
|---|---|
| Anonymous | 1,000 req/min |
| Auth endpoints | 20 req/min |
| Authenticated (JWT) | 5,000 req/min |
| Webhooks | 10,000 req/min |
| Frontend | 300 req/min |

## DDoS Readiness

- **Max connections:** 10,000 per Gateway listener
- **Circuit breaker:** Breaks at 1,024 concurrent connections to backend
- **Rate limiting:** Redis-backed distributed limit
- **Buffer limit:** 32MB per connection
- **Header sanitation:** Underscored headers rejected at ingress

## Security Headers

Applied by HTTPRoute ResponseHeaderModifier:
- `X-Frame-Options: SAMEORIGIN` (or DENY for admin)
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
- `X-Robots-Tag: noindex, nofollow` (admin/pastor portals)
