# KCM Platform — Comprehensive Error Handling Architecture

---

## 1. Principles of Error Governance

1. **Never Show Blank Screens**: Every React component subtree is protected by an accessible fallback.
2. **Never Expose Internal Details**: Stack traces, database query fragments, and file system paths are strictly redacted in client responses.
3. **Structured Diagnostics**: Every caught error generates a sanitized correlation ID linking client state to server logs.

---

## 2. Component Error Boundaries

- **`app/error.tsx`**: Route-level boundary featuring multi-lingual localization (English, Telugu, Hindi), retry action (`reset()`), and a 1-click issue reporting link directing to `/member/report?source=error_boundary`.
- **`app/global-error.tsx`**: Critical root fallback enclosing `<html>` and `<body>` tags in the event the main layout itself fails.

---

## 3. Server-Side Error Normalization

```typescript
// backend/src/middleware/errorHandler.js & frontend/lib/apiResponse.ts
export function createErrorResponse(err: unknown, status = 500) {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    success: false,
    error: {
      message: isProduction ? "An unexpected error occurred." : (err as Error).message,
      code: "INTERNAL_SERVER_ERROR",
      timestamp: new Date().toISOString(),
    }
  };
}
```
