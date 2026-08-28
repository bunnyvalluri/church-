# Member Portal Module Specification

## Purpose
This document provides the functional and technical specification for the Member Portal, the self-service web and mobile dashboard empowering church members to manage their spiritual journey, track giving statements, register for events, and submit prayer requests.

## Scope
Covers frontend pages in `frontend/app/member/`, client components in `frontend/components/member/`, and member API endpoints in `frontend/app/api/member/`.

## Status
> Status: Implemented

---

## 1. Module Overview & Routes

| Route | Purpose | Permissions | Primary Components |
| :--- | :--- | :--- | :--- |
| `/member` | Member Overview Dashboard | `MEMBER` | Quick stats, recent sermons, upcoming registrations, prayer feed |
| `/member/profile` | Personal Profile & Avatar Photo | `MEMBER` | Profile editor, password change, notification preferences |
| `/member/events` | Registered Events & QR Badges | `MEMBER` | Event tickets, pass download, check-in QR code modal |
| `/member/prayers` | Submitted Prayer Requests | `MEMBER` | Prayer submission form, pastoral status tracking |
| `/member/give` | Personal Giving Statements | `MEMBER` | Donation history table, annual tax statement download |
| `/member/sermons` | Saved & Bookmarked Sermons | `MEMBER` | Bookmarked audio/video messages, personal notes |
| `/member/volunteer` | Ministry Volunteering Activity | `MEMBER` | Assigned team schedules, ministry team chats |

---

## 2. Key Member Capabilities

```mermaid
graph TD
    Member([Authenticated Member]) --> Portal[/member Dashboard]
    
    Portal --> Profile[Update Name, Phone, Address & Cloudinary Avatar]
    Portal --> Giving[View Online Giving & Download 80G Tax Receipts]
    Portal --> Events[View Registered Events & Present Check-In QR Pass]
    Portal --> Prayers[Submit Confidential / Public Prayer Requests]
    Portal --> Sermons[Access Bookmarked Sermon Audio & Notes]
```

### 2.1 Profile & Avatar Upload
- Members can update their personal contact details and upload profile photos.
- Profile photos stream directly to Cloudinary (`church-platform/profiles`) and persist in PostgreSQL under `User.image`.

### 2.2 Giving Statements & Tax Receipts
- Queries personal donations filtered by date range or tax year.
- Generates official signed PDF donation receipts via `/api/receipts/[id]/pdf`.

### 2.3 Event Passes & QR Check-In
- For each registered event, members receive a digital pass with a unique QR code.
- At church venues, door ushers scan the QR code to verify registration and record attendance instantly.

---

## 3. Associated API Endpoints

- `GET /api/member/profile` — Retrieves the authenticated member profile.
- `PUT /api/member/profile` — Updates member details and avatar public ID.
- `GET /api/member/events` — Returns registered events with check-in badge tokens.
- `GET /api/member/prayers` — Retrieves member's submitted prayer requests.
- `POST /api/member/prayers` — Submits a new prayer request.
- `GET /api/donations/history` — Returns member's donation transactions.
- `GET /api/member/notification-preferences` — Manages SMS/FCM/Email opt-in settings.

---

## 4. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Member cannot see donation receipt | Payment completed but webhook delayed | Refresh page after 30 seconds; or verify Razorpay/Stripe transaction status via `/api/donations/status/[sessionId]`. |
| Profile photo upload fails | Image file exceeds 5MB limit | Client displays immediate size error with guidance to select smaller image. |

---

## Security Considerations
- Row-level scoping ensures members can only access and modify their own records.
- Session tokens are re-validated on every API request.

## Related Documentation
- [Authentication.md](Authentication.md) — Login and session management.
- [Donations.md](Donations.md) — Giving systems and receipts.
- [Prayer-System.md](Prayer-System.md) — Prayer pipeline.
