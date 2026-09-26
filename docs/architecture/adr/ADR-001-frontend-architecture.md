# ADR-001: Next.js 14 App Router & Hybrid Server/Client Component Architecture

## Status
`ACCEPTED`

## Context
KCM requires a high-performance web platform delivering fast initial page loads (LCP < 1.2s), multilingual accessibility (English, Telugu, Hindi), SEO discoverability for sermons and church locations, and real-time interaction for live prayers and volunteer coordination.

## Decision
Adopt Next.js 14 with the App Router:
- Utilize React Server Components (RSC) for static layouts, SEO metadata, schema.org graphs, and pre-rendered SSG content.
- Restrict Client Components (`'use client'`) to interactive modals, forms, camera capture, and WebSockets.
- Enforce standard Tailwind CSS design tokens preserving the KCM luxury white/minimal visual identity.

## Consequences
- **Positive**: Exceptional Core Web Vitals, minimal client bundle footprint, automatic static page generation (148/148 routes).
- **Negative**: Requires strict discipline to separate client hooks from server components.
