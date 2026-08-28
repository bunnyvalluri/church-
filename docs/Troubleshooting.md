# Operational Troubleshooting & Diagnostics Guide

## Purpose
This document provides an authoritative, structured troubleshooting guide for diagnosing and resolving real-world operational problems across the Kingdom of Christ Ministries platform.

## Scope
Covers builds, Docker containers, Kubernetes workloads, databases (PostgreSQL & MongoDB), Firebase auth, Cloudinary media, caching, and edge routing.

## Status
> Status: Implemented & Verified

---

## 1. Database & Persistence Problems

### 1.1 PostgreSQL Connection Pool Exhaustion
- **Symptoms**: Next.js API routes return HTTP 500 with `PrismaClientInitializationError: Can't reach database server at localhost:5432` or queries take > 10 seconds.
- **Cause**: Application pods creating multiple unpooled PrismaClient instances during hot-module reloading, exceeding PostgreSQL's `max_connections` (200).
- **Solution**:
  1. Verify the singleton pattern in `frontend/lib/db.ts` is in use across all server components and API routes.
  2. Route all production database traffic through the PgBouncer connection pooler on port 5432 (`kcm-db-pooler.kcm-system.svc`).
- **Verification**: Run `kubectl exec -it <pgbouncer-pod> -n kcm-system -- psql -p 5432 -U pgbouncer -d pgbouncer -c "SHOW POOLS;"` and confirm active clients are sharing pool connections.
- **Prevention**: Enforce singleton Prisma client check in CI linting.

---

### 1.2 MongoDB Atlas Connection Timeout
- **Symptoms**: `MongoServerSelectionError: Server selection timed out after 30000 ms`.
- **Cause**: Outbound pod IP address is not whitelisted in the MongoDB Atlas Network Access security list.
- **Solution**:
  1. Add the Kubernetes cluster NAT Gateway static public IP to the MongoDB Atlas IP Access List.
  2. For local development, set `MONGODB_OFFLINE="true"` in `.env.local` to bypass Atlas connection requirements.
- **Verification**: Run `node scripts/test-mongodb-integration.js` to assert connection success.
- **Prevention**: Configure MongoDB Atlas VPC Peering or AWS PrivateLink in production.

---

## 2. Authentication & Identity Problems

### 2.1 Google Sign-In Audience Mismatch
- **Symptoms**: Google Sign-In button logs error: `Invalid Google ID Token (audience mismatch)` upon `/api/auth/sync` callback.
- **Cause**: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (used by browser client) and `GOOGLE_CLIENT_ID` (used by server token verification) have differing values in `.env`.
- **Solution**: Ensure both environment variables match the exact Web Client ID created in Google Cloud Console.
- **Verification**: Authenticate via `/login` using Google Sign-In and verify redirect to `/member`.
- **Prevention**: Enforce variable equality assertion in Next.js startup validation script.

---

### 2.2 Firebase Service Account JSON Parsing Error
- **Symptoms**: `FirebaseAppError: Failed to parse service account JSON from FIREBASE_ADMIN_SERVICE_ACCOUNT`.
- **Cause**: Service account private key string contains unescaped newlines or corrupted base64 encoding.
- **Solution**: Base64 encode the service account JSON before setting the environment variable:
  ```bash
  node -e "console.log(Buffer.from(require('fs').readFileSync('./serviceAccount.json')).toString('base64'))"
  ```
- **Verification**: Run `node scripts/test_firebase.mjs` to assert token verification capability.
- **Prevention**: Use base64 encoding for all multi-line JSON secrets in Kubernetes Secret manifests.

---

## 3. Media & Cloudinary Problems

### 3.1 Upload Payload Too Large (HTTP 413)
- **Symptoms**: Uploading high-resolution event banners or sermon videos returns HTTP 413 Payload Too Large.
- **Cause**: Default Next.js body parser limits requests to 1MB.
- **Solution**: In the target Next.js API route handler, configure streaming route segment options:
  ```typescript
  export const dynamic = "force-dynamic";
  export const maxDuration = 60; // Allow 60s for video streaming
  ```
  And stream the file buffer directly to Cloudinary using `uploadBufferToCloudinary()`.
- **Verification**: Upload a 50MB video file in the Pastor Portal (`/pastor/sermons`) and verify 200 OK response.
- **Prevention**: Enforce client-side file size pre-checks before submitting upload requests.

---

## 4. Kubernetes & Infrastructure Problems

### 4.1 Pod in `CrashLoopBackOff` (Read-Only Root Filesystem)
- **Symptoms**: Workload pod fails to start with error: `EROFS: read-only file system, open '/app/.next/cache/...'`.
- **Cause**: Pod Security Standard enforces `readOnlyRootFilesystem: true`, blocking writes to container root disk.
- **Solution**: Mount an ephemeral Kubernetes `emptyDir` volume at the target cache directory in the pod deployment manifest (`k8s/frontend.yaml`):
  ```yaml
  volumeMounts:
    - name: cache-volume
      mountPath: /app/.next/cache
  volumes:
    - name: cache-volume
      emptyDir: {}
  ```
- **Verification**: Check pod status: `kubectl get pods -n kcm-system -l app=kcm-frontend` (Status should be `Running`).
- **Prevention**: Test all container builds with `--read-only` flag during local Docker testing.

---

### 4.2 Argo Rollouts Canary Stuck in `Paused` State
- **Symptoms**: Production deployment reaches 20% traffic weight and stops progressing.
- **Cause**: Expected behavior during progressive canary analysis step (waiting for Prometheus metric evaluation window to elapse).
- **Solution**:
  1. Inspect metric evaluation progress: `kubectl argo rollouts get rollout kcm-frontend-rollout -n kcm-system`.
  2. If metrics are healthy and immediate promotion is required for an emergency hotfix:
     ```bash
     kubectl argo rollouts promote kcm-frontend-rollout -n kcm-system
     ```
- **Verification**: Verify traffic weight shifts to 100% and old replicas are scaled down.
- **Prevention**: Configure appropriate canary pause durations in `platform/rollouts/`.

---

## 5. Frontend & Browser Compatibility Problems

### 5.1 Hydration Mismatch Error
- **Symptoms**: Red error overlay in development: `Hydration failed because the initial UI does not match the server-rendered HTML`.
- **Cause**: Client component rendering date objects formatted with local device timezone (`new Date().toLocaleDateString()`) which differs from server UTC timezone.
- **Solution**: Standardize date formatting on both server and client using `date-fns` with explicit timezone (`Asia/Kolkata`) or wrap component in a mounted state guard:
  ```typescript
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <SkeletonLoader />;
  ```
- **Verification**: Reload `/events` and `/sermons` pages with zero console hydration warnings.
- **Prevention**: Run `npm run test:e2e` in CI to detect client hydration regressions.

---

## Related Documentation
- [Incident-Response.md](Incident-Response.md) — Severity classification and escalation.
- [Database-Architecture.md](Database-Architecture.md) — Database connection topology.
- [CloudNativePG.md](CloudNativePG.md) — Database failover runbooks.
