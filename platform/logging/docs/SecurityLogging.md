# Security & Compliance Logging Standard

## Security Event Taxonomy
All security-relevant operations emit JSON records formatted as follows:

```json
{
  "timestamp": "2026-07-29T16:55:00.000Z",
  "level": "AUDIT",
  "service": "kcm-backend-api",
  "category": "AUDIT",
  "security": {
    "event_type": "AUTH_FAILURE",
    "severity": "WARN",
    "outcome": "FAILURE",
    "actor": "user_12345",
    "target_resource": "/api/v1/donations",
    "reason": "Invalid Firebase ID token format"
  },
  "correlation_id": "c1f7a8b9-4d2e-4a1b-9f0e-8c7d6e5f4a3b"
}
```

## Tracked Events
1. **Falco Security Events**: Shell run in container, sensitive file read (`/etc/shadow`), unauthorized binary execution.
2. **Authentication Events**: Firebase Auth failures, token expiration, password resets.
3. **RBAC Events**: Unauthorized access attempts (403 Forbidden), privilege elevation requests.
