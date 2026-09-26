# Deployment Guide — Kingdom of Christ Ministries

## 1. Hosting Platforms
- **Primary Web App**: Vercel Serverless Edge Platform (`https://kcmchurch.vercel.app`)
- **Database**: Neon Serverless PostgreSQL (Cloud) / CloudNativePG (Kubernetes)
- **Asset Storage**: Cloudinary (Media CDN) & Firebase Cloud Storage
- **Worker / Background Service**: Docker / Kubernetes Deployment (`k8s/` and `docker/`)

---

## 2. Environment Variables Configuration

| Variable | Target | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Vercel / K8s | Neon PostgreSQL connection string (`sslmode=require`) |
| `NEXTAUTH_SECRET` | Vercel / K8s | 32-byte cryptographic secret for session signing |
| `NEXTAUTH_URL` | Vercel / K8s | Canonical production origin (`https://kcmchurch.vercel.app`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Vercel / K8s | Public Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Vercel / K8s | Server-only Razorpay secret |
| `CLOUDINARY_API_KEY` | Vercel / K8s | Server-only Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Vercel / K8s | Server-only Cloudinary API secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Vercel / K8s | Cloudinary cloud identifier |

---

## 3. Production Deployment Checklist
1. Verify `npm run lint` and `npm run typecheck` pass.
2. Verify `npm run i18n:check` reports 100% key parity across all languages.
3. Ensure no local `.env` files are tracked in Git.
4. Run production smoke tests (`npm run test:smoke`).
