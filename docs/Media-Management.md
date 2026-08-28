# Media Management & Verification Pipeline

## Purpose
This document specifies the end-to-end media management lifecycle, asynchronous verification loops, CDN delivery architecture, and storage policies across the Kingdom of Christ Ministries platform.

## Scope
Covers frontend file selection, server-side streaming, database metadata persistence, background verification routines, and edge CDN delivery.

## Status
> Status: Implemented

---

## 1. End-to-End Media Pipeline

```mermaid
graph TD
    Client[Browser / Mobile Client] -->|1. File Selection & Client Validation| NextUpload[Next.js Upload Handlers /api/upload/*]
    NextUpload -->|2. Buffer Stream (MIME Verified)| CloudinaryCDN[Cloudinary CDN Infrastructure]
    CloudinaryCDN -->|3. Transformations (f_auto, q_auto)| CloudinaryStorage[Cloudinary Global Storage]
    NextUpload -->|4. Persist Secure URL & Public ID| PG[(PostgreSQL Database)]
    
    subgraph Background Healing & Verification
        VerificationLoop[Upload Verification Loop (backend/src/loops/*)] -->|5. Poll Unverified Assets| PG
        VerificationLoop -->|6. HTTP HEAD Accessibility Check| CloudinaryCDN
        VerificationLoop -->|7. Mark Verified / Alert Failure| PG
    end

    subgraph Edge CDN Consumption
        CloudinaryCDN -->|8. Optimized Edge Delivery (WebP/AVIF)| EndUsers[Website Visitors & App Users]
    end
```

---

## 2. Media Upload Endpoints

| Endpoint Route | Permitted File Types | Size Bound | Associated Database Model |
| :--- | :--- | :--- | :--- |
| `/api/upload/event-image` | JPEG, PNG, WebP | 10 MB | `Event.image`, `Event.eventBanner` |
| `/api/upload/event-video` | MP4, MOV, WebM | 100 MB | `Event.videoUrl`, `EventMedia` |
| `/api/upload/sermon` | MP4, MP3, PDF | 250 MB | `Sermon.videoUrl`, `Sermon.audioUrl` |
| `/api/upload/profile-image`| JPEG, PNG, WebP | 5 MB | `User.image`, `User.profilePublicId` |
| `/api/upload/ngo-media` | JPEG, PNG, WebP | 15 MB | `NgoProjectMedia` |
| `/api/upload/service-icon` | SVG, PNG | 2 MB | `Service.iconUrl` |

---

## 3. Background Verification & Self-Healing Loops

To prevent broken image links on public-facing pages, the companion backend runs automated verification loops (`backend/src/loops/uploadVerificationLoop.js`):

1. **Scheduled Polling**: Every 10 minutes, the loop queries PostgreSQL for media records created or updated within the last 24 hours.
2. **HTTP HEAD Probe**: Performs a non-blocking `HEAD` request to the Cloudinary CDN URL to verify HTTP 200 OK status.
3. **Automated Healing**: If an asset returns 404 or 5xx, the loop marks the record status as `DEGRADED`, attempts re-upload from temporary staging cache, or notifies administrators via the system alert channel.

---

## 4. CDN Caching & Edge Optimization

- **Global Edge Network**: Cloudinary distributes assets across multi-region Akamai, Fastly, and CloudFront edge nodes.
- **Cache-Control Headers**: Delivered with `Cache-Control: public, max-age=31536000, immutable` for public assets, guaranteeing optimal browser caching.
- **Client Adaptive Delivery**: Uses Client Hints (`Accept`, `DPR`, `Viewport-Width`) to deliver the smallest viable payload to mobile devices.

---

## 5. Troubleshooting & Runbooks

| Issue | Root Cause | Remediation |
| :--- | :--- | :--- |
| Media upload fails with timeout | Slow network connection on large video upload | Use chunked uploads or direct client-side unsigned upload presets with signed signature endpoints. |
| Broken thumbnail on mobile | High DPI device requesting unavailable transformation | Ensure `f_auto,q_auto` presets are applied via `getOptimizedCloudinaryUrl()`. |
| Orphaned media accumulation | Entity deleted in database without triggering `deleteCloudinaryAsset` | Run `scripts/cleanup-orphaned-media.js` monthly to reconcile database public IDs with Cloudinary storage. |

---

## Security Considerations
- All file buffers are inspected for MIME type and magic numbers before transmission to prevent malicious script uploads.
- Upload routes require authenticated staff or admin session tokens.

## Related Documentation
- [Cloudinary.md](Cloudinary.md) — SDK implementation and folder structure.
- [Performance.md](Performance.md) — Image and video optimization metrics.
