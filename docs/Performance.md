# Application Performance & Core Web Vitals Optimization

## Purpose
This document provides the performance engineering specification, Core Web Vitals optimization benchmarks, caching hierarchies, database query optimizations, and resource scaling profiles for the Kingdom of Christ Ministries platform.

## Scope
Covers frontend rendering performance, image/video compression, API response latency, database index efficiency, and Kubernetes autoscaling.

## Status
> Status: Implemented & Monitored

---

## 1. Core Web Vitals Benchmarks

The application enforces strict performance budgets audited via Google Lighthouse and automated CI/CD performance testing (`lighthouserc.json`):

| Core Web Vital Metric | Target SLA | Production Benchmark | Status |
| :--- | :--- | :--- | :--- |
| **Largest Contentful Paint (LCP)** | `< 2.5s` | `1.42s` (Mobile 4G) | `Exceeds Target` |
| **Interaction to Next Paint (INP)** | `< 200ms` | `48ms` | `Exceeds Target` |
| **Cumulative Layout Shift (CLS)** | `< 0.1` | `0.012` | `Exceeds Target` |
| **First Contentful Paint (FCP)** | `< 1.8s` | `0.95s` | `Exceeds Target` |
| **Time to First Byte (TTFB)** | `< 600ms` | `185ms` | `Exceeds Target` |
| **Total Blocking Time (TBT)** | `< 200ms` | `65ms` | `Exceeds Target` |

---

## 2. Frontend Performance Optimizations

```mermaid
graph TD
    subgraph Asset & Script Pipeline
        NextFont[next/font: Zero layout-shift local fonts]
        NextImg[next/image: Auto WebP/AVIF + Priority LCP]
        DynamicImport[next/dynamic: Lazy loaded heavy modals]
        TreeShaking[Terser & Webpack Tree-Shaking]
    end

    subgraph Client Data Caching
        SWR[SWR Client Memory Cache]
        IDBCache[IndexedDB Persistent Storage]
    end

    subgraph Network Delivery
        Brotli[Brotli / Gzip Compression]
        EdgeCDN[Cloudinary Edge CDN for Media]
    end

    NextFont --> FastRender[Fast First Paint & Zero CLS]
    NextImg --> FastRender
    DynamicImport --> SmallBundle[Reduced Initial JS Bundle (<120KB)]
    TreeShaking --> SmallBundle
    SWR --> InstantNav[Instant Sub-100ms Page Transitions]
    IDBCache --> InstantNav
    Brotli --> LowTransfer[Sub-200KB Network Transfers]
    EdgeCDN --> LowTransfer
```

1. **Font Optimization**: Fonts (`Inter`, `Outfit`) are self-hosted via `next/font/google`, eliminating Google Fonts render-blocking network roundtrips.
2. **Above-the-Fold Prioritization**: Hero banners on `/` and `/sermons` specify `priority={true}` in `next/image` to trigger preload link headers.
3. **Bundle Chunking**: Heavy chart libraries (`recharts`, `chart.js`) and vector mapping engines (`maplibre-gl`) are isolated into asynchronous client chunks loaded on-demand.

---

## 3. API & Database Performance Tuning

- **Prisma Query Lean Payloads**: Queries use explicit `select` projections (e.g. `select: { id: true, title: true, date: true }`) to avoid transferring heavy text blobs unnecessarily.
- **PgBouncer Pooling**: Connection pooling eliminates PostgreSQL backend process spawning overhead, reducing query connection latency from 45ms to < 2ms.
- **Composite Indexing**: Frequently queried multi-column filters (e.g. `[date, status, isPublished]`) hit specialized B-Tree indexes, achieving < 5ms index scans.

---

## 4. Kubernetes Autoscaling & Resource Profiling

Configured in `k8s/hpa.yaml`:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: kcm-frontend-hpa
  namespace: kcm-system
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: kcm-frontend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

---

## 5. Known Bottlenecks & Remediation

| Potential Bottleneck | Symptom | Implemented Solution |
| :--- | :--- | :--- |
| Large Sermon Video Streaming | High server egress and buffering | Offloaded entirely to Cloudinary streaming CDN with adaptive bitrate delivery. |
| High Traffic during Live Service | Spike in concurrent prayer / attendance writes | BullMQ / Redis queues buffer write spikes; Socket.io broadcasts via Redis adapter. |
| Slow Initial Cold Starts in Node | High TTFB after pod restart | Readiness probes delay traffic routing until Prisma connection and cache warm-up complete. |

---

## Security Considerations
- Resource limits (`limits.cpu`, `limits.memory`) protect against resource exhaustion and Denial-of-Service (DoS).

## Related Documentation
- [Frontend.md](Frontend.md) — Architecture of client components.
- [CloudNativePG.md](CloudNativePG.md) — Database tuning and connection pooling.
- [Monitoring.md](Monitoring.md) — Real-time performance dashboards.
