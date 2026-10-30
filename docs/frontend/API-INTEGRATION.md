# KCM Church — Frontend API Integration Engine

**Core Client**: [`frontend/src/services/apiClient.ts`](file:///C:/K.C.M-Portal/frontend/src/services/apiClient.ts)

---

## 1. Engine Capabilities

1. **Typed Requests and Responses**: Every call is generic `api.get<T>(url, config)`, ensuring compile-time type verification.
2. **Exponential Backoff with Jitter**: Automatically retries transient 5xx server errors and network timeouts on safe `GET` requests (up to 2 retries, 400ms base delay with randomized jitter).
3. **Idempotency-Key Attachment**: Mutating requests (`POST`, `PUT`, `DELETE`) automatically receive an `Idempotency-Key` header (`UUIDv4` or timestamped hash) to prevent duplicate transactions if network retries occur.
4. **In-Flight Deduplication**: Concurrent duplicate `GET` requests share a single in-flight promise, reducing server load and mobile radio wakeups.
5. **AbortController & Timeout Support**: Default 10-second timeout on requests prevents hanging connections on cellular networks.
6. **Error Normalization**: Maps raw HTTP errors into standard categories: `VALIDATION_ERROR`, `AUTH_REQUIRED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `TIMEOUT`, `SERVER_ERROR`.

---

## 2. Usage Pattern

```typescript
import { api } from '@/services/apiClient';
import { ChurchEvent } from '@/features/events';

// GET with query parameters and typing
const response = await api.get<{ events: ChurchEvent[]; total: number }>('/api/events', {
  params: { campusId: 'branch_kukatpally', limit: 10 },
  timeoutMs: 8000,
});

if (response.ok && response.data) {
  console.log(response.data.events);
} else {
  console.error(response.error, response.classification);
}
```

