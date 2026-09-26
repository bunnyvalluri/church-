# Database Architecture & Security Model

## Overview
The KCM Platform database layer is powered by **PostgreSQL 16** managed via **Prisma ORM 5.11.0**, hosted on **Neon Serverless PostgreSQL** with optional **CloudNativePG** clustering for Kubernetes deployments.

---

## Key Models & Boundaries

1. **Member & User Management (`members`)**:
   - Stores authenticated user records, roles (`SUPER_ADMIN`, `ADMIN`, `PASTOR`, `MEMBER`, `EVENT_MANAGER`, `FIELD_VOLUNTEER`), profile references, and hashed credentials (`bcryptjs`).
2. **Sermons & Media (`sermons`, `sermon_media`, `sermon_views`)**:
   - Stores sermon metadata, scripture references, audio/video links, timestamps, view counts, and engagement metrics.
3. **Donations & 80G Receipts (`donations`, `donation_sessions`, `receipts`)**:
   - Handles donor transactions, UPI UTR numbers, Razorpay order bindings, audit verification flags (`amount_verified`, `signature_verified`), and auto-generated PDF receipts with unique verification codes.
4. **Events & Attendance (`events`, `event_registrations`, `event_attendance`, `event_reports`)**:
   - Manages worship services, conferences, registration capacities, QR codes, and volunteer field reports.
5. **Security & Audit Logs (`audit_logs`, `payment_webhooks`, `notification_logs`)**:
   - Records administrative mutations, payment webhook history, delivery attempts, and security-relevant actions.

---

## Security Policies
- **Strict Parameterization**: All DB interactions run through Prisma ORM prepared statements.
- **SSL/TLS Mandate**: All remote database connections require `sslmode=require`.
- **Sensitive Field Isolation**: Password hashes, tokens, and payment secrets are omitted from API projections.
