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
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const server = http.createServer(app);

const PROCESS_TYPE = process.env.PROCESS_TYPE || 'all';
const PORT = process.env.SOCKET_PORT || (PROCESS_TYPE === 'api' ? 3001 : 3001);

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
      
      Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        console.log('[SOCKET] Redis Adapter initialized.');
      }).catch(err => console.warn('[SOCKET] Redis Adapter connection skipped:', err.message));
    } catch (e) {
      console.warn('[SOCKET] Redis module not found. Running in-memory mode.');
    }

    io.on('connection', (socket) => {
      console.log(`[SOCKET] Client connected: ${socket.id}`);
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
    const { type, payload } = req.body;
    
    if (!type || !payload) {
      return res.status(400).json({ error: "Event type and payload are required." });
    }

    console.log(`[EVENT] Received trigger for: ${type}`, payload);
    
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
      emitter.emit(type, payload);
      emitter.emit('notification:popup', notification);
    } else {
      console.warn('[API] No socket emitter configured. Event not broadcasted.');
    }
    
    return res.json({ success: true });
  });

  app.get('/health', (req, res) => {
    return res.json({ status: "OK", time: new Date(), type: PROCESS_TYPE });
  });
}

let queueInitialized = false;
if (PROCESS_TYPE === 'all' || PROCESS_TYPE === 'worker') {
  try {
    const { Queue, Worker } = require('bullmq');
    const Redis = require('ioredis');

    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    
    // Upstash (rediss://) requires TLS configuration for ioredis
    const connectionOptions = {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };
    
    if (redisUrl.startsWith('rediss://')) {
      connectionOptions.tls = { rejectUnauthorized: false };
    }

    const connection = new Redis(redisUrl, connectionOptions);

    connection.on('error', (err) => {
      console.warn(`[QUEUE] Redis connection failed: ${err.message}`);
      console.warn('[QUEUE] Redis connection skipped (running queue in-memory fallback).');
    });

    connection.on('connect', () => {
      console.log('[QUEUE] Connected to Redis. Initializing BullMQ...');
      
      // Initialize Queue only to prevent errors, Worker processes jobs
      const mediaQueue = new Queue('media-uploads', { connection });
      
      new Worker('media-uploads', async (job) => {
        console.log(`[WORKER] Processing media job: ${job.id} (reportId: ${job.data.reportId})`);
        await new Promise(r => setTimeout(r, 2000));
        console.log(`[WORKER] Successfully optimized upload media for report ${job.data.reportId}`);
      }, { connection });

      queueInitialized = true;
    });

  } catch (err) {
    console.log('[QUEUE] BullMQ dependencies not configured. Bypassing worker setup.');
  }
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[SERVER ERROR] Port ${PORT} is already in use. Please stop any existing backend processes.`);
    process.exit(1);
  } else {
    console.error(`[SERVER ERROR] ${err.message}`);
  }
});

// Workers don't necessarily need to listen to a port, but listening gives a health check endpoint if we use Express.
// Actually, in pure worker mode, we might not want to start HTTP unless we need health probes.
// For Kubernetes, an HTTP health check is very useful.
if (PROCESS_TYPE !== 'worker') {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`==================================================`);
    console.log(`🚀 KCM Companion Server (${PROCESS_TYPE}) running on http://0.0.0.0:${PORT}`);
    if (PROCESS_TYPE === 'all' || PROCESS_TYPE === 'socket') console.log(`🔌 Socket.io connections are active`);
    if (PROCESS_TYPE === 'all') console.log(`📡 BullMQ queue processing active: ${queueInitialized}`);
    console.log(`==================================================`);
  });
} else {
  // Pure worker mode - we still listen for k8s probes if we want, but let's just use it
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`==================================================`);
    console.log(`📡 BullMQ Worker running and listening for probes on port ${PORT}`);
    app.get('/health', (req, res) => res.json({ status: 'OK', type: 'worker' }));
    console.log(`==================================================`);
  });
}
