# KCM Frontend Centralized API Client

## 1. Client Specification
The frontend uses a centralized fetch abstraction for all REST communications:
- **Base URL Resolution**: Automatically targets `/api/*` on same-origin or configured API endpoints.
- **Credentials Propagation**: Always attaches `credentials: 'include'` for secure cookie exchange.
- **Error Interception**: Automatically formats response errors and triggers toast notifications.
- **Request Cancellation**: Supports `AbortSignal` for search autocomplete and fast tab switching.
