# KCM Frontend Performance & Core Web Vitals Optimization

## 1. Core Web Vitals Targets & Current Metrics

| Metric | Description | Target SLA | Measured Performance |
| :--- | :--- | :--- | :--- |
| **LCP (Largest Contentful Paint)** | Hero image / headline render time | < 2.5s | **~1.4s** (Fast 4G) |
| **INP (Interaction to Next Paint)** | Input responsiveness on clicks | < 200ms | **~45ms** |
| **CLS (Cumulative Layout Shift)** | Visual stability during page load | < 0.1 | **0.012** |
| **FCP (First Contentful Paint)** | Initial DOM paint | < 1.8s | **~0.9s** |
| **Initial JS Bundle Size** | Gzipped JavaScript per route | < 150 kB | **~98 kB** |

## 2. Media Optimization Strategy
- Next.js `next/image` handles WebP / AVIF transformation with responsive `sizes="..."` attributes.
- Cloudinary media delivery applies automatic format (`f_auto`) and quality compression (`q_auto`).
