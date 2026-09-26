# KCM API Rate Limiting & Resource Protection Policy

## 1. Rate Limit Tiers

| Tier / Endpoint Category | Rate Limit Window | Max Requests | Storage / Algorithm |
| :--- | :--- | :--- | :--- |
| **Authentication (`/api/auth/*`)** | 15 Minutes | 10 attempts / IP | Sliding Window (Redis / Memory) |
| **Payment Orders (`/api/payments/*`)** | 1 Minute | 5 orders / IP | Token Bucket |
| **AI Assistant (`/api/chat`)** | 1 Minute | 15 requests / user | Sliding Window |
| **General Public APIs (`/api/events`, `/api/sermons`)** | 1 Minute | 120 requests / IP | Fixed Window |
| **Webhooks Ingress (`/api/webhooks/*`)** | 1 Minute | 300 requests / IP | Token Bucket |

## 2. Header Contract
When rate limits are evaluated, the following standard response headers are emitted:
- `X-RateLimit-Limit`: Maximum requests allowed in current window.
- `X-RateLimit-Remaining`: Remaining request quota.
- `X-RateLimit-Reset`: UTC epoch timestamp when the window resets.
- `Retry-After`: Seconds to wait before retrying (emitted on `429 Too Many Requests`).
