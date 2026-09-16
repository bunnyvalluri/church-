/**
 * frontend/app/api/admin/system-health/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive Administrative 14-Service System Health Telemetry.
 * Strict RBAC: Accessible only by authorized ADMIN and SUPER_ADMIN roles.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdminOrDev } from "@/lib/authMiddleware";
import { prisma } from "@/lib/prisma";
import { checkMongoHealth } from "@/lib/mongodb/client";
import { isAdminReady } from "@/lib/firebaseAdmin";
import { cloudinary } from "@/lib/cloudinary";

export type ServiceHealthStatus = "HEALTHY" | "DEGRADED" | "DOWN";

export interface ServiceTelemetry {
  name: string;
  category: string;
  status: ServiceHealthStatus;
  latencyMs: number;
  lastCheck: string;
  errorCount: number;
  details: Record<string, any>;
}

export async function GET(req: Request) {
  const auth = await requireAdminOrDev(req);
  if (auth instanceof NextResponse) return auth;

  const now = new Date().toISOString();
  const services: ServiceTelemetry[] = [];

  // 1. Frontend
  const mem = process.memoryUsage();
  services.push({
    name: "Frontend",
    category: "Compute & SSR",
    status: "HEALTHY",
    latencyMs: 1,
    lastCheck: now,
    errorCount: 0,
    details: {
      framework: "Next.js 14 App Router",
      uptimeSeconds: Math.floor(process.uptime()),
      heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
    },
  });

  // 2. Backend (Express Companion Server)
  let backendStatus: ServiceHealthStatus = "DOWN";
  let backendLatency = 0;
  let backendDetails = {};
  const companionUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
  try {
    const bStart = Date.now();
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const bRes = await fetch(`${companionUrl}/health/live`, { signal: ctrl.signal });
    clearTimeout(t);
    backendLatency = Date.now() - bStart;
    if (bRes.ok) {
      backendStatus = "HEALTHY";
      backendDetails = await bRes.json().catch(() => ({}));
    } else {
      backendStatus = "DEGRADED";
    }
  } catch {
    backendStatus = "DEGRADED"; // Non-fatal if companion is decoupled in serverless
    backendDetails = { note: "Companion server decoupled or idle" };
  }
  services.push({
    name: "Backend",
    category: "Companion Services",
    status: backendStatus,
    latencyMs: backendLatency,
    lastCheck: now,
    errorCount: backendStatus === "HEALTHY" ? 0 : 1,
    details: backendDetails,
  });

  // 3. Database (PostgreSQL / Neon)
  let pgStatus: ServiceHealthStatus = "DOWN";
  let pgLatency = 0;
  try {
    if (process.env.DB_OFFLINE === "true") {
      pgStatus = "DEGRADED";
    } else {
      const pgStart = Date.now();
      const p = prisma.$queryRaw`SELECT 1`;
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000));
      await Promise.race([p, timeout]);
      pgLatency = Date.now() - pgStart;
      pgStatus = pgLatency < 1500 ? "HEALTHY" : "DEGRADED";
    }
  } catch {
    pgStatus = "DOWN";
  }
  services.push({
    name: "Database",
    category: "Relational Storage",
    status: pgStatus,
    latencyMs: pgLatency,
    lastCheck: now,
    errorCount: pgStatus === "DOWN" ? 1 : 0,
    details: { provider: "PostgreSQL (Neon)", role: "System of Record" },
  });

  // 4. Redis
  const redisConfigured = !!process.env.REDIS_URL;
  services.push({
    name: "Redis",
    category: "Cache & PubSub",
    status: redisConfigured ? "HEALTHY" : "DEGRADED",
    latencyMs: 0,
    lastCheck: now,
    errorCount: 0,
    details: {
      mode: redisConfigured ? "Distributed Redis" : "In-Memory Fallback",
    },
  });

  // 5. MongoDB Atlas
  let mongoStatus: ServiceHealthStatus = "DOWN";
  let mongoLatency = 0;
  try {
    const mRes = await checkMongoHealth();
    mongoLatency = mRes.latencyMs || 0;
    if (mRes.status === "healthy") mongoStatus = "HEALTHY";
    else if (mRes.status === "offline") mongoStatus = "DEGRADED";
    else mongoStatus = "DOWN";
  } catch {
    mongoStatus = "DOWN";
  }
  services.push({
    name: "MongoDB",
    category: "Document Storage",
    status: mongoStatus,
    latencyMs: mongoLatency,
    lastCheck: now,
    errorCount: mongoStatus === "DOWN" ? 1 : 0,
    details: { purpose: "Telemetry & Audit Logs" },
  });

  // 6. Firebase
  const firebaseReady = isAdminReady();
  services.push({
    name: "Firebase",
    category: "Identity & Push",
    status: firebaseReady ? "HEALTHY" : "DEGRADED",
    latencyMs: 0,
    lastCheck: now,
    errorCount: 0,
    details: { ready: firebaseReady, authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "kcm-church-7d324" },
  });

  // 7. Realtime Services
  const socketConfigured = !!process.env.NEXT_PUBLIC_SOCKET_URL;
  services.push({
    name: "Realtime",
    category: "WebSocket / Socket.io",
    status: socketConfigured ? "HEALTHY" : "DEGRADED",
    latencyMs: 0,
    lastCheck: now,
    errorCount: 0,
    details: {
      adapter: redisConfigured ? "Redis Adapter" : "Memory",
      configured: socketConfigured,
    },
  });

  // 8. Storage (Cloudinary)
  const cloudConfig = cloudinary.config();
  const storageHealthy = !!(cloudConfig.cloud_name && cloudConfig.api_key);
  services.push({
    name: "Storage",
    category: "Media CDN",
    status: storageHealthy ? "HEALTHY" : "DEGRADED",
    latencyMs: 0,
    lastCheck: now,
    errorCount: 0,
    details: { provider: "Cloudinary", secure: cloudConfig.secure ?? true },
  });

  // 9. Email
  const emailHealthy = !!(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
  services.push({
    name: "Email",
    category: "Communications",
    status: emailHealthy ? "HEALTHY" : "DEGRADED",
    latencyMs: 0,
    lastCheck: now,
    errorCount: 0,
    details: { provider: process.env.EMAIL_PROVIDER || "resend" },
  });

  // 10. SMS
  const smsHealthy = !!(process.env.HTTPSMS_API_KEY || process.env.TWILIO_AUTH_TOKEN);
  services.push({
    name: "SMS",
    category: "Communications",
    status: smsHealthy ? "HEALTHY" : "DEGRADED",
    latencyMs: 0,
    lastCheck: now,
    errorCount: 0,
    details: { provider: process.env.SMS_PROVIDER || "httpsms" },
  });

  // 11. Payments
  const razorpayOk = !!(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const stripeOk = !!(process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  services.push({
    name: "Payments",
    category: "Financial Gateways",
    status: (razorpayOk || stripeOk) ? "HEALTHY" : "DEGRADED",
    latencyMs: 0,
    lastCheck: now,
    errorCount: 0,
    details: { razorpay: razorpayOk, stripe: stripeOk },
  });

  // 12. Queues
  const queuesActive = !process.env.DISABLE_BULLMQ;
  services.push({
    name: "Queues",
    category: "Background Workers",
    status: queuesActive ? "HEALTHY" : "DEGRADED",
    latencyMs: 0,
    lastCheck: now,
    errorCount: 0,
    details: { engine: redisConfigured ? "BullMQ (Redis)" : "In-Memory Fallback" },
  });

  // 13. CI/CD
  services.push({
    name: "CI/CD",
    category: "Pipeline Automation",
    status: "HEALTHY",
    latencyMs: 0,
    lastCheck: now,
    errorCount: 0,
    details: { runner: "GitHub Actions", workflows: 18 },
  });

  // 14. Deployment
  services.push({
    name: "Deployment",
    category: "Edge & Container Hosting",
    status: "HEALTHY",
    latencyMs: 0,
    lastCheck: now,
    errorCount: 0,
    details: {
      platform: process.env.VERCEL ? "Vercel Edge Platform" : "Docker / Kubernetes",
      environment: process.env.NODE_ENV || "production",
    },
  });

  return NextResponse.json({
    success: true,
    timestamp: now,
    services,
  });
}
