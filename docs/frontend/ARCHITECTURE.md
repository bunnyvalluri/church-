# KCM Frontend Architecture & Next.js 14 Structure

## 1. App Router & Route Group Structure
The frontend is built on Next.js 14 App Router with React Server Components (RSC) by default and isolated Client Components (`"use client"`) for interactivity.

```
frontend/app/
├── (public)/          # Marketing, landing page, events, sermons, beliefs, stories
├── (auth)/            # Login, register, forgot-password, portal-select
├── member/            # Authenticated Member self-service portal
├── pastor/            # Branch Pastor management dashboard
├── admin/             # Church Administration, Finance, Content, OpenClaw AI
├── event-manager/     # Event logistics, registration check-in, attendance reports
├── ngo/               # Community outreach, hospital visits, NGO volunteers
└── api/               # Server Actions & Route Handlers
```

## 2. Server vs. Client Component Boundaries
- **Server Components (Default)**: Layouts, static content, SEO metadata generators, and initial data fetchers.
- **Client Components (`"use client"`)**: Form inputs, modals/dialogs, live audio player, prayer submission wizards, and interactive analytics charts.
