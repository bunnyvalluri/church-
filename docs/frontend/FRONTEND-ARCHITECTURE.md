# Kingdom of Christ Ministries (KCM Church) — Frontend Architecture Specification

**Version**: 3.0.0-PRODUCTION  
**Framework**: Next.js 14.2 (App Router) • React 18.3 • TypeScript (Strict) • Tailwind CSS 3.4  
**Design Philosophy**: Pure White Minimalist Theme (Zero Dark Mode) • High Contrast • 44px Touch Compliance  
**Classification**: Production-Grade System Architecture

---

## 1. Architectural Overview

The KCM Church frontend is structured as a feature-driven, scalable, and accessible Next.js App Router application. It balances public-facing evangelical outreach (sermons, ministries, prayer requests, NGO projects, dynamic locations) with authenticated church governance (Member, Admin, Pastor, Event Manager, Field Volunteer portals).

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT VIEWPORT                                   │
│   iOS Safari • Android Chrome • Samsung Internet • Desktop Chrome / Edge / FF   │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                               NEXT.JS EDGE LAYER                                 │
│   • Edge Middleware (`middleware.ts`)                                            │
│   • Cryptographic Session Cookie (`kcm_session`) & Role-Based Routing Matrix     │
│   • Security Headers (CSP, Strict-Transport-Security, X-Frame-Options)           │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐
│           PUBLIC WEB EXPERIENCE       │ │        AUTHENTICATED PORTALS          │
│   • Home, About, Sermons, Events      │ │   • Member Portal (/member)           │
│   • Prayer Wall, Online Giving        │ │   • Pastor Portal (/pastor)           │
│   • NGO Projects & Feeding Programs   │ │   • Admin Portal (/admin)             │
│   • Hyderabad Campus Directory        │ │   • Event Manager (/event-manager)    │
└───────────────────┬───────────────────┘ └───────────────────┬───────────────────┘
                    │                                         │
                    └────────────────────┬────────────────────┘
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION & STATE LAYER                               │
│   • Feature Modules (`frontend/src/features/*`)                                 │
│   • White-Theme UI Design System (`frontend/src/components/ui/*`)               │
│   • Multilingual Translation Engine (en / te / hi with 100% key parity)         │
│   • Offline PWA Queue (`OfflineSyncManager` & IndexedDB)                         │
│   • Real-time Socket.IO Connection (`getRealtimeSocket`)                        │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           CENTRALIZED API CLIENT                                 │
│   • `ApiService` (`frontend/src/services/apiClient.ts`)                          │
│   • Exponential backoff with jitter • In-flight request deduplication            │
│   • Automatic Idempotency-Key header on state-changing mutations                │
│   • HTTP status normalization (400, 401, 403, 404, 409, 422, 429, 500)          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Layout & Module Responsibilities

```
frontend/
├── app/                        # Next.js 14 App Router routes & layouts
├── public/                     # Static assets, PWA manifest, robots, sitemaps
├── src/
│   ├── components/
│   │   └── ui/                 # 25+ accessible White-Theme Design System components
│   ├── features/               # 18 Modular business domains
│   │   ├── auth/               # Sign-in, register, GIS token verification
│   │   ├── events/             # Church event cards, registration, check-in
│   │   ├── donations/          # Razorpay payment orders, 80G tax receipt data
│   │   ├── sermons/            # Media streaming catalog, notes, view tracker
│   │   ├── prayer-requests/    # Prayer wall & pastoral petitions
│   │   ├── branches/           # Hyderabad campuses directory & selector
│   │   ├── attendance/         # QR ticket scanner & check-in metrics
│   │   ├── members/            # Member directory & profile management
│   │   ├── ngo/                # Feeding & community care outreach
│   │   ├── offline-sync/       # IndexedDB mutation queue & conflict handler
│   │   ├── volunteers/         # Department rosters & applications
│   │   ├── finance/            # Offering reconciliation & fund analytics
│   │   ├── notifications/      # FCM push tokens & notification inbox
│   │   ├── media/              # Cloudinary signed upload integration
│   │   ├── groups/             # Small groups & home cell fellowships
│   │   ├── announcements/      # Bulletins & urgent notices
│   │   ├── reports/            # Executive church metrics
│   │   └── admin/              # Cluster diagnostics & audit logs
│   ├── services/               # Centralized typed HTTP API engine
│   ├── styles/                 # Pure white design tokens & contrast definitions
│   ├── stores/                 # Lightweight type-safe reactive state stores
│   ├── pwa/                    # Service worker registration & cache policies
│   ├── realtime/               # Socket.IO connection & room subscriptions
│   ├── i18n/                   # Language switching & INR/date formatters
│   ├── constants/              # Application constants & roles
│   ├── config/                 # Environment variables & runtime flags
│   └── types/                  # Centralized domain contract interfaces
```

---

## 3. Core Architectural Principles

1. **Zero Client-Side Trust**: Roles, user identities, and financial calculations originate from the server. The frontend never assumes permissions based on local storage or URL parameters.
2. **Strict White-Theme Consistency**: `forcedTheme="light"` prevents dark-mode inversion, providing a crisp, dignified church brand experience with dark slate typography and royal violet accents.
3. **Accessibility by Default**: Every interactive element satisfies WCAG 2.1 AA requirements, providing keyboard focus rings, screen-reader aria labels, and 44x44px touch targets.
4. **Resilient Offline-First Sync**: Critical field workflows (event check-in, prayer submission) function when offline and synchronize via an idempotent queue once connectivity resumes.

