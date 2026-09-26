# KCM Platform System Architecture

## Overview
Kingdom of Christ Ministries (KCM) is built as a modern, high-performance monorepo serving congregational web interactions, administrative governance, pastoral research workflows, event management, and 80G tax-exempt donation processing.

---

## Architecture Blueprint

```
                     ┌─────────────────────────────────────────┐
                     │          Clients / Edge Network         │
                     │  (Vercel Edge Network / DNS / SSL)      │
                     └────────────────────┬────────────────────┘
                                          │
                     ┌────────────────────▼────────────────────┐
                     │          Next.js Edge Middleware        │
                     │  • Web Crypto HMAC-SHA256 Session Verify│
                     │  • Path Routing & Portals Multiplexing  │
                     │  • Anti-CSRF Origin Validation          │
                     │  • Security Response Headers (CSP/HSTS) │
                     └────────────────────┬────────────────────┘
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        │                                 │                                 │
┌───────▼──────────────┐       ┌──────────▼───────────┐          ┌──────────▼───────────┐
│ Public Pages & App   │       │ Protected Portals    │          │ Route Handlers (API) │
│ • Landing / Services │       │ • Admin Dashboard    │          │ • /api/donations/*   │
│ • Video Theater      │       │ • Pastor Portal      │          │ • /api/sermons/*     │
│ • Events / Gallery   │       │ • Event Manager      │          │ • /api/admin/*       │
│ • Giving / 80G Form  │       │ • Member Area        │          │ • /api/health/*      │
└──────────────────────┘       └──────────────────────┘          └──────────┬───────────┘
                                                                            │
                                                                 ┌──────────▼───────────┐
                                                                 │   Prisma ORM Layer   │
                                                                 │  (Parameterized SQL) │
                                                                 └──────────┬───────────┘
                                                                            │
                                                                 ┌──────────▼───────────┐
                                                                 │ Neon Postgres Server │
                                                                 │ (SSL/TLS Encrypted)  │
                                                                 └──────────────────────┘
```

---

## Core Pillars

1. **Edge-Driven Multi-Tenant Portals**:
   - Single Next.js codebase seamlessly providing role-tailored dashboards for Administrators, Senior Pastors, Event Coordinators, Field Volunteers, and Church Members.
2. **Deterministic Internationalization**:
   - High-speed, zero-bundle overhead context engine with identical key matrices for English, Telugu, and Hindi.
3. **Resilient Realtime Fallback**:
   - Socket.IO client configured to operate cleanly without console warnings or errors across production serverless HTTPS environments.
4. **Hardened Offline-First PWA**:
   - Service Worker (v6) with explicit scheme validation (`http:`, `https:` only) protecting against browser extension cache exceptions.
