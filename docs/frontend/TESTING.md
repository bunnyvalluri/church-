# KCM Church — Frontend Testing & QA Automation Strategy

**Test Framework**: Playwright & Node Test Runner  
**Test Location**: [`frontend/tests/`](file:///C:/K.C.M-Portal/frontend/tests)

---

## 1. Test Execution Commands

```bash
# 1. Typecheck strict verification
npm run typecheck -w frontend

# 2. Multilingual translation parity audit
npm run i18n:check -w frontend

# 3. Accessibility & WCAG 2.1 AA test suite
npm run test:a11y -w frontend

# 4. Responsive design & mobile viewport tests
npm run test:responsive -w frontend

# 5. Role-Based Access Control matrix tests
npm run test:rbac -w frontend

# 6. Route health across all 148 routes
npm run test:health -w frontend

# 7. Production smoke tests
npm run test:smoke -w frontend
```

---

## 2. Test Coverage Matrix

* **E2E & RBAC Matrix**: Verifies unauthenticated users are redirected from `/admin/*`, `/pastor/*`, and `/member/*` to `/login`.
* **Form Validation**: Asserts rejection of invalid emails, malformed phone numbers, and negative donation amounts.
* **Offline Sync**: Tests mutation enqueueing when `navigator.onLine === false` and automatic clearing upon sync.
* **Accessibility**: Audits color contrast, focus management, and screen-reader headings.

