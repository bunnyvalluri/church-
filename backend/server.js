/**
 * backend/server.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-time companion Socket.io and background worker server.
 * Supports split execution via PROCESS_TYPE env var for Kubernetes.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
// Load backend-local .env FIRST (overrides root .env for dev-specific vars like REDIS_URL)
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });
// Load root .env as fallback for shared vars (DATABASE_URL, API keys, etc.)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Prometheus Metrics Instrumentation
let metrics;
try {
  metrics = require('./src/metrics');
  app.use(metrics.metricsMiddleware);
} catch (e) {
  console.warn('[METRICS] Metrics module loading note:', e.message);
}

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-KCM-Webhook-Secret");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rate Limiting
const { generalLimiter, webhookLimiter, notificationLimiter } = require('./src/middleware/rateLimiter');
app.use(generalLimiter);

// Webhook verification middleware
const { verifyGoogleWebhook } = require('./src/middleware/webhookVerify');

// ── Notification & Event Routes ───────────────────────────────────────────────

// Register FCM device token
app.post('/api/device-tokens', async (req, res) => {
  try {
    const { token, userId, deviceType, platform } = req.body;
    if (!token) return res.status(400).json({ error: 'token is required' });

    const { registerDeviceToken } = require('./src/services/fcmService');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const record = await registerDeviceToken({ token, userId, deviceType, platform }, prisma);
    return res.json({ success: true, id: record.id });
  } catch (err) {
    console.error('[DEVICE_TOKEN] Registration error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Event creation endpoint (called by Event Manager / Next.js API)
app.post('/api/events', async (req, res) => {
  try {
    const { processEventUploadLoop } = require('./src/loops/eventUploadLoop');
    const event = await processEventUploadLoop(req.body, io);
    return res.status(201).json({ success: true, event });
  } catch (err) {
    console.error('[API/EVENTS] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Google Apps Script webhook — receives member data and/or triggers notifications
app.post('/api/google-event-trigger', webhookLimiter, verifyGoogleWebhook, async (req, res) => {
  try {
    const { event_title, event_branch, event_date, event_description, event_link, event_id } = req.body;
    console.log('[GOOGLE_WEBHOOK] Received event trigger:', event_title);

    // If this is called back from Apps Script with member data, log it
    const { members } = req.body;
    if (members && Array.isArray(members)) {
      console.log(`[GOOGLE_WEBHOOK] Apps Script returned ${members.length} members.`);
    }

    return res.json({
      success: true,
      message: 'Google webhook received.',
      received: { event_title, event_branch, event_date },
    });
  } catch (err) {
    console.error('[GOOGLE_WEBHOOK] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Manual notification dispatch endpoint (admin use)
app.post('/api/notifications/dispatch', notificationLimiter, async (req, res) => {
  try {
    const { eventId, branch, channels } = req.body;
    if (!eventId) return res.status(400).json({ error: 'eventId is required' });

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const { dispatchEventNotification } = require('./src/services/notificationDispatcher');
    // Non-blocking — respond immediately
    res.json({ success: true, message: 'Notification dispatch started.', eventId });

    // Dispatch in background
    dispatchEventNotification(event, { branch: branch || null }).catch(err => {
      console.error('[NOTIFY_DISPATCH] Background dispatch error:', err.message);
    });

  } catch (err) {
    console.error('[NOTIFY_DISPATCH] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Notification retry trigger (manual)
app.post('/api/notifications/retry', async (req, res) => {
  try {
    const { runNotificationRetryWorker } = require('./src/cron/notificationRetryWorker');
    const summary = await runNotificationRetryWorker();
    return res.json({ success: true, summary });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Agent Reach Internet Intelligence Routes ─────────────────────────────────
const agentReachEngine = require('./src/services/agentReachEngine');

// 1. Sermon Research Agent
app.post('/api/agents/sermon-research', async (req, res) => {
  try {
    const task = await agentReachEngine.runSermonResearch(req.body, io);
    return res.json({ success: true, task });
  } catch (err) {
    console.error('[AGENT/SERMON_RESEARCH] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Church News Agent (Get cached articles & manual refresh)
app.get('/api/agents/church-news', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const articles = await prisma.churchNewsArticle.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 20
    });
    return res.json({ success: true, count: articles.length, articles });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/agents/church-news/fetch', async (req, res) => {
  try {
    const task = await agentReachEngine.runChurchNewsFetch(req.body, io);
    return res.json({ success: true, task });
  } catch (err) {
    console.error('[AGENT/CHURCH_NEWS] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Event Inspiration Agent
app.post('/api/agents/event-inspiration', async (req, res) => {
  try {
    const task = await agentReachEngine.runEventInspiration(req.body, io);
    return res.json({ success: true, task });
  } catch (err) {
    console.error('[AGENT/EVENT_INSPIRATION] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Social Content Agent
app.post('/api/agents/social-content', async (req, res) => {
  try {
    const task = await agentReachEngine.runSocialContent(req.body, io);
    return res.json({ success: true, task });
  } catch (err) {
    console.error('[AGENT/SOCIAL_CONTENT] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Developer Support Agent
app.post('/api/agents/developer-support', async (req, res) => {
  try {
    const task = await agentReachEngine.runDeveloperSupport(req.body, io);
    return res.json({ success: true, task });
  } catch (err) {
    console.error('[AGENT/DEVELOPER_SUPPORT] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Agent Task History Endpoints
app.get('/api/agents/tasks', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const tasks = await prisma.agentReachTask.findMany({
      include: { sources: true },
      orderBy: { createdAt: 'desc' },
      take: 15
    });
    return res.json({ success: true, tasks });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/agents/tasks/:id', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const task = await prisma.agentReachTask.findUnique({
      where: { id: req.params.id },
      include: { sources: true }
    });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    return res.json({ success: true, task });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});



const server = http.createServer(app);

const PROCESS_TYPE = process.env.PROCESS_TYPE || 'all';
const BASE_PORT = parseInt(process.env.SOCKET_PORT || '3001', 10);

let io;
let redisEmitter;

if (PROCESS_TYPE === 'all' || PROCESS_TYPE === 'socket' || PROCESS_TYPE === 'api') {
  // If Redis is configured, we set up either the Redis Adapter (for sockets) or Emitter (for api)
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  
  if (PROCESS_TYPE === 'all' || PROCESS_TYPE === 'socket') {
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    try {
      const { createClient } = require('redis');
      const { createAdapter } = require('@socket.io/redis-adapter');
      
      const pubClient = createClient({ url: redisUrl });
      const subClient = pubClient.duplicate();
      
      pubClient.on('error', (err) => console.warn('[SOCKET] Redis pubClient error:', err.message));
      subClient.on('error', (err) => console.warn('[SOCKET] Redis subClient error:', err.message));
      
      Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        console.log('[SOCKET] Redis Adapter initialized.');
      }).catch(err => console.warn('[SOCKET] Redis Adapter connection skipped:', err.message));
    } catch (e) {
      console.warn('[SOCKET] Redis module not found. Running in-memory mode.');
    }

    io.on('connection', (socket) => {
      console.log(`[SOCKET] Client connected: ${socket.id}`);
      
      socket.on('join', (room) => {
        if (room && typeof room === 'string') {
          socket.join(room);
          console.log(`[SOCKET] Client ${socket.id} joined room: ${room}`);
        }
      });

      socket.on('disconnect', () => {
        console.log(`[SOCKET] Client disconnected: ${socket.id}`);
      });
    });
  }
  
  if (PROCESS_TYPE === 'api') {
    try {
      const { createClient } = require('redis');
      const { Emitter } = require('@socket.io/redis-emitter');
      const redisClient = createClient({ url: redisUrl });
      redisClient.on('error', (err) => console.warn('[API] Redis client error:', err.message));
      
      redisClient.connect().then(() => {
        redisEmitter = new Emitter(redisClient);
        console.log('[API] Redis Emitter initialized.');
      }).catch(err => console.warn('[API] Redis Emitter connection skipped:', err.message));
    } catch(e) {
      console.warn('[API] Redis Emitter module not found. API webhooks won\'t reach sockets in split mode.');
    }
  }
}

if (PROCESS_TYPE === 'all' || PROCESS_TYPE === 'api') {
  app.post('/api/trigger-event', (req, res) => {
    const { type, payload, room } = req.body;
    
    if (!type || !payload) {
      return res.status(400).json({ error: "Event type and payload are required." });
    }

    console.log(`[EVENT] Received trigger for: ${type} ${room ? `in room ${room}` : '(global)'}`, payload);
    
    const notification = {
      type: payload.popupType || 'new-event',
      title: payload.title || 'New Event Uploaded',
      description: payload.description || `Branch: ${payload.branchName || 'General'}`,
      timestamp: new Date(),
      icon: payload.icon || 'event',
      link: payload.link || '/event-manager'
    };

    // Emit using emitter if running as pure API, else local io instance
    const emitter = (PROCESS_TYPE === 'api' && redisEmitter) ? redisEmitter : io;
    
    if (emitter) {
      if (room) {
        emitter.to(room).emit(type, payload);
        emitter.to(room).emit('notification:popup', notification);
      } else {
        emitter.emit(type, payload);
        emitter.emit('notification:popup', notification);
      }
    } else {
      console.warn('[API] No socket emitter configured. Event not broadcasted.');
    }
    
    return res.json({ success: true });
  });

  app.get('/health', (req, res) => {
    return res.json({ status: "OK", time: new Date(), type: PROCESS_TYPE });
  });

  // Loop Engineering Architecture Initialization & Diagnostic Endpoint
  try {
    const { initializeLoopEngine, runLoopHealthCheck } = require('./src/loops/engine');
    const { processEventUploadLoop } = require('./src/loops/eventUploadLoop');
    const { processSermonAutomationLoop } = require('./src/loops/sermonAutomationLoop');
    const { runSecurityAuditScan } = require('./src/loops/securityLoop');
    const { runUploadVerificationLoop } = require('./src/loops/uploadVerificationLoop');
    const { processNotificationLoop } = require('./src/loops/notificationLoop');
    const { runDeploymentHealthLoop } = require('./src/loops/deploymentHealthLoop');
    const { runDatabaseAuditLoop } = require('./src/loops/databaseAuditLoop');
    const { sendSuccess, sendError } = require('./src/utils/apiResponse');

    initializeLoopEngine(io);

    // Master Health Diagnostic Endpoint
    app.get('/api/loops/health', async (req, res, next) => {
      try {
        const report = await runLoopHealthCheck(io);
        return sendSuccess(res, report, 'Master loop health check completed.');
      } catch (err) {
        next(err);
      }
    });

    // 1. Event Automation Loop Endpoint
    app.post('/api/loops/event', async (req, res, next) => {
      try {
        const event = await processEventUploadLoop(req.body, io);
        return sendSuccess(res, event, 'Event automation loop executed successfully.');
      } catch (err) {
        next(err);
      }
    });

    // 2. Sermon Automation Loop Endpoint
    app.post('/api/loops/sermon', async (req, res, next) => {
      try {
        const sermon = await processSermonAutomationLoop(req.body, io);
        return sendSuccess(res, sermon, 'Sermon automation loop executed successfully.');
      } catch (err) {
        next(err);
      }
    });

    // 3. Security Audit Loop Endpoint
    app.post('/api/loops/security-audit', async (req, res, next) => {
      try {
        const scan = await runSecurityAuditScan();
        return sendSuccess(res, scan, 'Security audit scan completed.');
      } catch (err) {
        next(err);
      }
    });

    // 4. Upload Verification Loop Endpoint
    app.post('/api/loops/upload-verification', async (req, res, next) => {
      try {
        const report = await runUploadVerificationLoop();
        return sendSuccess(res, report, 'Upload verification scan completed.');
      } catch (err) {
        next(err);
      }
    });

    // 5. Notification Loop Endpoint
    app.post('/api/loops/notification', async (req, res, next) => {
      try {
        const result = await processNotificationLoop(req.body, io);
        return sendSuccess(res, result, 'Notification loop executed successfully.');
      } catch (err) {
        next(err);
      }
    });

    // 6. Deployment Health Loop Endpoint
    app.post('/api/loops/deployment-health', async (req, res, next) => {
      try {
        const report = await runDeploymentHealthLoop(io);
        return sendSuccess(res, report, 'Deployment health probe completed.');
      } catch (err) {
        next(err);
      }
    });

    // 7. Database Audit Loop Endpoint
    app.post('/api/loops/db-audit', async (req, res, next) => {
      try {
        const report = await runDatabaseAuditLoop();
        return sendSuccess(res, report, 'Database audit loop completed.');
      } catch (err) {
        next(err);
      }
    });

    // 8. OpenClaw Specialized AI Skill Execution Endpoint
    app.post('/api/openclaw/execute', async (req, res) => {
      try {
        const { skillId, input, userContext } = req.body;
        if (!skillId) return res.status(400).json({ success: false, error: 'skillId is required' });

        const { handleBackendOpenClawSkillExecution } = require('./src/skills/openclawBackendSkills');
        const result = await handleBackendOpenClawSkillExecution(skillId, input || {}, userContext || {}, io);
        return res.json(result);
      } catch (err) {
        console.error('[OPENCLAW_API] Execution error:', err.message);
        return res.status(500).json({ success: false, error: err.message });
      }
    });

    // Mount Centralized Error Handler
    const errorHandler = require('./src/middleware/errorHandler');
    app.use(errorHandler);
  } catch (err) {
    console.warn('[LOOP_ENGINE_INIT] Warning initializing Loop Engine:', err.message);
  }

  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', metrics ? metrics.register.contentType : 'text/plain');
      res.end(metrics ? await metrics.register.metrics() : '# Metrics unavailable');
    } catch (ex) {
      res.status(500).end(ex.message);
    }
  });
}

let queueInitialized = false;
const DISABLE_BULLMQ = process.env.DISABLE_BULLMQ === 'true';

if (!DISABLE_BULLMQ && (PROCESS_TYPE === 'all' || PROCESS_TYPE === 'worker')) {
  try {
    const { Queue, Worker } = require('bullmq');
    const Redis = require('ioredis');

    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    
    // Upstash (rediss://) requires TLS configuration for ioredis
    const connectionOptions = {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      // Limit retries in dev so it doesn't hang on ECONNREFUSED
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('[QUEUE] Redis not available after 3 attempts. BullMQ disabled.');
          return null; // stop retrying
        }
        return Math.min(times * 500, 2000);
      },
    };
    
    if (redisUrl.startsWith('rediss://')) {
      connectionOptions.tls = { rejectUnauthorized: false };
    }

    const connection = new Redis(redisUrl, connectionOptions);

    connection.on('error', (err) => {
      if (!err.message.includes('ECONNREFUSED')) {
        console.warn(`[QUEUE] Redis connection warning: ${err.message}`);
      }
    });

    let mediaQueue;
    let worker;

    connection.on('connect', () => {
      if (queueInitialized) return;
      console.log('[QUEUE] Connected to Redis. Initializing BullMQ...');
      
      try {
        mediaQueue = new Queue('media-uploads', { connection });
        mediaQueue.on('error', (err) => {
          console.warn(`[QUEUE] BullMQ Queue error: ${err.message}`);
        });
        
        worker = new Worker('media-uploads', async (job) => {
          console.log(`[WORKER] Processing media job: ${job.id} (reportId: ${job.data.reportId})`);
          await new Promise(r => setTimeout(r, 2000));
          console.log(`[WORKER] Successfully optimized upload media for report ${job.data.reportId}`);
        }, { connection });

        worker.on('error', (err) => {
          console.warn(`[WORKER] BullMQ Worker note: ${err.message}`);
          if (err.message && err.message.includes('max requests limit exceeded')) {
            console.warn('[WORKER] Upstash Redis quota limit reached. Pausing worker...');
            worker.pause(true).catch(() => {});
          }
        });

        queueInitialized = true;
      } catch (e) {
        console.warn('[QUEUE] BullMQ initialization skipped:', e.message);
      }
    });

  } catch (err) {
    console.log('[QUEUE] BullMQ dependencies not configured. Bypassing worker setup.');
  }
} else if (DISABLE_BULLMQ) {
  console.log('[QUEUE] BullMQ disabled (DISABLE_BULLMQ=true). Skipping Redis/queue setup.');
}

// Global Process Error Protection
process.on('uncaughtException', (err) => {
  console.error('[SERVER UNCAUGHT EXCEPTION]', err.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[SERVER UNHANDLED REJECTION]', reason?.message || reason);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n[SERVER] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[SERVER] HTTP server closed.');
    process.exit(0);
  });
  setTimeout(() => { process.exit(0); }, 3000);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ── Port auto-retry (handles EADDRINUSE gracefully) ───────────────────────────
function startServer(port, attempt = 0) {
  if (attempt > 5) {
    console.error('[SERVER ERROR] Could not find a free port after 5 attempts. Exiting.');
    process.exit(1);
  }

  server.listen(port, '0.0.0.0')
    .once('listening', () => {
      const actualPort = server.address().port;
      console.log('==================================================');
      if (PROCESS_TYPE === 'worker') {
        console.log(`📡 BullMQ Worker running and listening for probes on port ${actualPort}`);
        app.get('/health', (req, res) => res.json({ status: 'OK', type: 'worker', port: actualPort }));
      } else {
        console.log(`🚀 KCM Companion Server (${PROCESS_TYPE}) running on http://0.0.0.0:${actualPort}`);
        if (PROCESS_TYPE === 'all' || PROCESS_TYPE === 'socket') console.log('🔌 Socket.io connections are active');
        if (PROCESS_TYPE === 'all') console.log(`📡 BullMQ queue processing active: ${queueInitialized}`);
      }
      console.log('==================================================');
    })
    .once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = port + 1;
        console.warn(`[SERVER] Port ${port} is busy — trying port ${nextPort}...`);
        server.removeAllListeners('error');
        server.removeAllListeners('listening');
        startServer(nextPort, attempt + 1);
      } else {
        console.error(`[SERVER ERROR] ${err.message}`);
        process.exit(1);
      }
    });
}

startServer(BASE_PORT);
