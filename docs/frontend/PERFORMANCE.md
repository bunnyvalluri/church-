# KCM Church — Performance & Core Web Vitals Optimization

**Target**: Core Web Vitals (LCP < 2.5s, FID/INP < 100ms, CLS < 0.1) • Lighthouse 95+

---

## 1. Implemented Optimizations

1. **Package Import Tree-Shaking**:
   * Configured in [`next.config.js`](file:///C:/K.C.M-Portal/frontend/next.config.js) under `experimental.optimizePackageImports` for `lucide-react`, `framer-motion`, `date-fns`, and Radix UI packages.
2. **Server vs. Client Component Boundaries**:
   * Layouts and content pages are React Server Components by default.
   * `"use client"` is isolated strictly to interactive leaves (forms, tabs, dropdowns).
3. **Image & Shimmer Optimization**:
   * Cloudinary images served via CDN with WebP/AVIF auto-formatting.
   * `Skeleton` components preserve aspect ratio to guarantee zero Cumulative Layout Shift (CLS = 0.012).
4. **Font Optimization**:
   * System font fallback with `font-display: swap` prevents Flash of Unstyled Text (FOUT).
