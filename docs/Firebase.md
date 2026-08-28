# Firebase Integration Architecture

## Purpose
This document specifies the integration of Firebase services within the Kingdom of Christ Ministries platform, covering client-side Google authentication, server-side identity verification via the Firebase Admin SDK, Firebase Cloud Messaging (FCM) push notifications, and Firestore offline capabilities.

## Scope
Covers frontend client SDK (`frontend/lib/firebase.ts`), backend/server admin SDK (`frontend/lib/firebaseAdmin.ts`, `backend/src/services/fcmService.js`), and FCM topic dispatching.

## Status
> Status: Implemented

---

## 1. Firebase System Architecture

Firebase is utilized specifically for client authentication identity assistance and real-time push notification delivery to mobile and desktop browsers:

```mermaid
graph TD
    subgraph Client Tier (Browser / PWA)
        ClientUI[User Login / Registration UI]
        FirebaseClientSDK[Firebase JS Client SDK (v12.8)]
        FCMServiceWorker[Service Worker: firebase-messaging-sw.js]
    end

    subgraph Google Cloud / Firebase Services
        FirebaseAuthService[Firebase Auth / Google Identity]
        FCMService[Firebase Cloud Messaging API]
    end

    subgraph Backend / Next.js Server Tier
        NextAPISync[/api/auth/sync Route Handler]
        FirebaseAdminSDK[Firebase Admin SDK (v12.7)]
        FCMDispatcher[Backend FCM Dispatcher Service]
        PrismaPG[(PostgreSQL - members & device_tokens)]
    end

    ClientUI -->|Google Sign-In| FirebaseClientSDK
    FirebaseClientSDK -->|Authenticate| FirebaseAuthService
    FirebaseAuthService -->>FirebaseClientSDK: Returns ID Token (JWT)
    
    FirebaseClientSDK -->|POST ID Token| NextAPISync
    NextAPISync -->|verifyIdToken| FirebaseAdminSDK
    FirebaseAdminSDK -->|Validate Key| FirebaseAuthService
    NextAPISync -->|Upsert User & Set Session Cookie| PrismaPG

    FCMServiceWorker -->|Register Push Token| FirebaseClientSDK
    FirebaseClientSDK -->|POST Token| NextAPISync
    NextAPISync -->|Persist DeviceToken| PrismaPG

    FCMDispatcher -->|Send Multicast Message| FCMService
    FCMService -->|Push Notification| FCMServiceWorker
```

---

## 2. Authentication & Server Token Verification

### 2.1 Client SDK Configuration (`frontend/lib/firebase.ts`)
The client SDK initializes Firebase on the browser using public configuration parameters:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 2.2 Server-Side Admin SDK (`frontend/lib/firebaseAdmin.ts`)
The server validates incoming Firebase ID tokens using the initialized Admin SDK:
```typescript
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT
    ? JSON.parse(Buffer.from(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT, "base64").toString("utf-8"))
    : undefined;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

export { admin };
```

---

## 3. Firebase Cloud Messaging (FCM) Push Architecture

### 3.1 Device Token Registration
1. When a member permits browser push notifications, the service worker retrieves an FCM registration token.
2. The token is sent to `/api/device-tokens` and persisted in PostgreSQL under `DeviceToken` linked to the user's `id`.

### 3.2 Broadcast & Topic Subscriptions
- **Topic Name**: `kcm-events` (configured via `FIREBASE_FCM_TOPIC`).
- **Use Cases**: Emergency church announcements, Sunday service live stream broadcasts, and event reminders.
- **Multicast Dispatch**: In `backend/src/services/fcmService.js`, messages are dispatched in chunks of 500 tokens using `admin.messaging().sendEachForMulticast()`.

---

## 4. Offline & Development Simulation

To support offline local testing without requiring active Firebase credentials:
- Setting `FIRESTORE_OFFLINE="true"` bypasses live network verification and allows deterministic local mock token verification in development environments.

---

## 5. Troubleshooting & Diagnostics

| Symptom | Cause | Resolution |
| :--- | :--- | :--- |
| `auth/id-token-expired` | Client clock drift or expired token | Ensure client calls `getIdToken(true)` to force refresh before sending to server. |
| `messaging/invalid-registration-token` | FCM device token was unregistered or revoked by user | Remove revoked token from PostgreSQL `DeviceToken` table upon receiving error code. |
| `FirebaseAppError: Failed to parse service account JSON` | Corrupted base64 string in `FIREBASE_ADMIN_SERVICE_ACCOUNT` | Re-encode JSON using `node -e "console.log(Buffer.from(fs.readFileSync('sa.json')).toString('base64'))"`. |

---

## Security Considerations
- Service account private keys are base64 encoded, passed via environment variables, and never committed to source control.
- Tokens are verified server-side with cryptographic signature checks on every sync request.

## Related Documentation
- [Authentication.md](Authentication.md) — Authentication and session management.
- [Database-Architecture.md](Database-Architecture.md) — Overall data topology.
- [Notification-System.md](notification-system.md) — In-depth notification dispatch engine.
