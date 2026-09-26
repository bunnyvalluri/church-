# KCM Complete API Endpoint Inventory

This inventory documents all primary API routes across the KCM platform.

## 1. Authentication & Session Management
| Method | Path | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Public | Member registration with password hashing |
| `POST` | `/api/auth/login` | No | Public | Credential verification & HTTP-only JWT issue |
| `POST` | `/api/auth/google` | No | Public | Google GIS ID token server-side verification |
| `POST` | `/api/auth/logout` | Yes | Member+ | Session revocation & cookie clearing |
| `GET` | `/api/auth/session` | Yes | Member+ | Current session state & user profile |
| `POST` | `/api/auth/forgot-password`| No | Public | Password reset email dispatch with token |
| `POST` | `/api/auth/reset-password` | No | Public | Token-verified password reset |

## 2. Donations & Payment Processing
| Method | Path | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/donations/create` | Optional | Public/Member | Initialize donation session |
| `POST` | `/api/payments/create-order` | Optional | Public/Member | Create Razorpay order server-side |
| `POST` | `/api/payments/verify` | Optional | Public/Member | Server HMAC-SHA256 signature verification |
| `GET` | `/api/receipts/:id` | Yes | Member/Admin | View 80G tax receipt |
| `GET` | `/api/receipts/:id/pdf` | Yes | Member/Admin | Download PDF receipt |
| `POST` | `/api/webhooks/razorpay` | Signature | Gateway | Ingress for Razorpay payment webhooks |

## 3. Events & Attendance
| Method | Path | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | No | Public | List published church events (paginated) |
| `GET` | `/api/events/:slug` | No | Public | Fetch event details by slug |
| `POST` | `/api/events/:id/register` | Optional | Public/Member | Register for event with QR ticket creation |
| `POST` | `/api/events/:id/checkin` | Yes | Event Manager/Pastor | Record physical/virtual attendance |

## 4. Sermons & Media
| Method | Path | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/sermons` | No | Public | Search and browse sermons |
| `GET` | `/api/sermons/:id` | No | Public | View sermon details & notes |
| `POST` | `/api/sermons/:id/like` | Yes | Member | Like/unlike sermon |
| `POST` | `/api/sermons/:id/comment`| Yes | Member | Post comment on sermon |

## 5. Pastor & Administration Portals
| Method | Path | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/pastor/members` | Yes | PASTOR / ADMIN | Manage church branch members |
| `GET` | `/api/pastor/prayer-requests` | Yes | PASTOR / ADMIN | Review member prayer requests |
| `GET` | `/api/admin/analytics` | Yes | ADMIN / SUPER_ADMIN | System analytics & health statistics |
| `GET` | `/api/admin/audit-logs` | Yes | SUPER_ADMIN | View immutable security audit logs |

## 6. Real-Time, AI & Health Probes
| Method | Path | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/chat` | Optional | Public/Member | Church AI Assistant context query |
| `POST` | `/api/sync/offline` | Yes | Member+ | Reconcile offline IndexedDB queue |
| `GET` | `/api/health` | No | Internal/Public | Comprehensive platform health check |
| `GET` | `/api/live` | No | Kubernetes | Lightweight liveness probe |
| `GET` | `/api/ready` | No | Kubernetes | Readiness probe verifying DB connectivity |
