# KCM API Versioning & Evolution Strategy

## 1. Versioning Policy
- **Primary Routes**: High-level routes reside under `/api/*` following backwards-compatible evolution.
- **Breaking Changes**: If a breaking contract change is required for mobile/external consumers, path-based versioning (`/api/v1/*`, `/api/v2/*`) is adopted.
- **Deprecation Lifecycle**: Deprecated endpoints emit `Sunset` and `Deprecation` HTTP headers 90 days prior to retirement.
