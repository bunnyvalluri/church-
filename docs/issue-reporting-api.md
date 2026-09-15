# Issue Reporting API Reference

## 1. Member Endpoints

### `GET /api/member/reports`
- **Auth**: Required (`requireAuth`).
- **Query Params**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 50)
- **Response**:
```json
{
  "success": true,
  "reports": [
    {
      "id": "uuid",
      "reportId": "KCM-ERR-XXXXXXXX",
      "category": "SOMETHING_IS_BROKEN",
      "title": "Donation page submit button unresponsive",
      "severity": "HIGH",
      "status": "OPEN",
      "createdAt": "2026-09-15T15:30:00.000Z",
      "updatedAt": "2026-09-15T15:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### `POST /api/member/reports`
- **Auth**: Required (`requireAuth`).
- **Rate Limit**: 10 requests per 15 minutes per IP.
- **Request Body**:
```json
{
  "category": "SOMETHING_IS_BROKEN",
  "title": "Donation form unresponsive",
  "description": "Clicked Submit on Giving page but nothing happened.",
  "expectedBehavior": "Payment dialog should appear",
  "actualBehavior": "Button clicked but form stayed static",
  "severity": "HIGH",
  "pageUrl": "https://kcmchurch.vercel.app/member/give",
  "pagePath": "/member/give",
  "browser": "Google Chrome",
  "browserVersion": "128.0",
  "operatingSystem": "Windows 10/11",
  "deviceType": "desktop",
  "viewportWidth": 1920,
  "viewportHeight": 940,
  "screenWidth": 1920,
  "screenHeight": 1080,
  "timezone": "Asia/Kolkata",
  "language": "en",
  "onlineStatus": true,
  "connectionType": "4g",
  "screenshotUrl": "https://res.cloudinary.com/..."
}
```

### `GET /api/member/reports/:reportId`
- **Auth**: Required (`requireAuth`).
- **IDOR Guard**: Returns 404 if requested report does not belong to caller (unless admin).
- **Sanitization**: Strips internal admin notes, raw server traces, and admin assignments.

### `POST /api/member/reports/upload-screenshot`
- **Auth**: Required (`requireAuth`).
- **Body**: `FormData` containing `file` field.
- **Validation**: JPG, PNG, WebP, max 5MB, binary magic bytes checked.

---

## 2. Administrator Endpoints

### `GET /api/admin/reports`
- **Auth**: Admin required (`requireAdmin`).
- **Query Params**: `status`, `severity`, `category`, `search`, `page`, `limit`.

### `GET /api/admin/reports/:reportId`
- **Auth**: Admin required (`requireAdmin`).
- **Returns**: Full report including raw client stack trace, full diagnostic telemetry, and internal notes.

### `PATCH /api/admin/reports/:reportId/status`
- **Auth**: Admin required (`requireAdmin`).
- **Body**: `{ "status": "INVESTIGATING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "DUPLICATE" }`
- **Events**: Emits `report:status_changed` to Socket.IO and records security audit log.

### `PATCH /api/admin/reports/:reportId/assignment`
- **Auth**: Admin required (`requireAdmin`).
- **Body**: `{ "assignedTo": "engineer@kcmchurch.com" }`

### `POST /api/admin/reports/:reportId/notes`
- **Auth**: Admin required (`requireAdmin`).
- **Body**: `{ "note": "Root cause identified in payment gateway timeout." }`
