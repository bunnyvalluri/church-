# KCM Platform — Disaster Recovery & Business Continuity

---

## 1. RPO & RTO Targets

- **Recovery Point Objective (RPO)**: < 15 minutes (Neon PostgreSQL point-in-time recovery).
- **Recovery Time Objective (RTO)**: < 30 minutes (Automated redeployment via Vercel & GitHub Actions).

---

## 2. Failover Protocols

1. **Database Failover**: Neon managed instant branch switch to replica endpoint.
2. **Media CDN Outage**: Cloudinary asset caching on Cloudflare CDN edge; fallback to local optimized WebP assets in `public/`.
3. **Companion Worker Outage**: Next.js App Router core operates independently in serverless mode; background tasks queue in memory or wait for worker reboot.
