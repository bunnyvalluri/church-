/**
 * backend/src/queues/queueManager.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Queue Manager supporting Redis (BullMQ) & In-Memory Fallback.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const config = require('../loops/config');
const { handleJobFailure } = require('./retrySystem');

let Queue, Worker;
let redisAvailable = false;
const queues = {};
const workers = {};
const inMemoryHandlers = {};
const inMemoryQueues = {};

try {
  const bullmq = require('bullmq');
  Queue = bullmq.Queue;
  Worker = bullmq.Worker;
} catch (e) {
  console.warn('[QUEUE_MANAGER] BullMQ package not loaded. Operating in In-Memory mode.');
}

/**
 * Initialize Queue by key from config.
 */
function getQueue(queueKey) {
  const queueConfig = config.queues[queueKey];
  if (!queueConfig) throw new Error(`Unknown queue key: ${queueKey}`);

  if (queues[queueKey]) return queues[queueKey];

  if (Queue && process.env.REDIS_URL) {
    try {
      const connection = { url: config.redisUrl };
      const q = new Queue(queueConfig.name, { connection });
      queues[queueKey] = q;
      redisAvailable = true;
      console.log(`[QUEUE] BullMQ Queue initialized: ${queueConfig.name}`);
      return q;
    } catch (err) {
      console.warn(`[QUEUE] Redis queue connection failed for ${queueConfig.name}. Falling back to in-memory.`);
    }
  }

  // Fallback In-Memory Queue Wrapper
  if (!inMemoryQueues[queueKey]) {
    inMemoryQueues[queueKey] = [];
  }

  const memoryQueueWrapper = {
    name: queueConfig.name,
    isMemory: true,
    add: async (jobName, data) => {
      const job = { id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, name: jobName, data, attemptsMade: 0 };
      inMemoryQueues[queueKey].push(job);
      console.log(`[IN_MEMORY_QUEUE] Job enqueued to ${queueConfig.name}: ${jobName}`);
      
      // Immediate asynchronous execution if handler registered
      if (inMemoryHandlers[queueKey]) {
        setImmediate(() => processInMemoryJob(queueKey, job, inMemoryHandlers[queueKey]));
      }
      return job;
    },
  };

  queues[queueKey] = memoryQueueWrapper;
  return memoryQueueWrapper;
}

/**
 * Register Worker for a queue key.
 */
function registerWorker(queueKey, processorFn) {
  const queueConfig = config.queues[queueKey];
  if (!queueConfig) throw new Error(`Unknown queue key: ${queueKey}`);

  inMemoryHandlers[queueKey] = processorFn;

  if (Worker && process.env.REDIS_URL && redisAvailable) {
    try {
      const connection = { url: config.redisUrl };
      const w = new Worker(queueConfig.name, processorFn, {
        connection,
        concurrency: queueConfig.concurrency,
      });

      w.on('failed', async (job, err) => {
        await handleJobFailure(job, err, queueConfig.name, queueConfig.attempts);
      });

      workers[queueKey] = w;
      console.log(`[WORKER] BullMQ Worker registered: ${queueConfig.name}`);
      return w;
    } catch (err) {
      console.warn(`[WORKER] Redis worker registration failed for ${queueConfig.name}. Using in-memory runner.`);
    }
  }

  console.log(`[WORKER] In-Memory Worker registered: ${queueConfig.name}`);
}

async function processInMemoryJob(queueKey, job, processorFn) {
  try {
    job.attemptsMade = (job.attemptsMade || 0) + 1;
    await processorFn(job);
    console.log(`[IN_MEMORY_WORKER] Successfully processed job ${job.id} on queue ${queueKey}`);
  } catch (err) {
    const queueConfig = config.queues[queueKey];
    const outcome = await handleJobFailure(job, err, queueKey, queueConfig.attempts);
    if (outcome.shouldRetry) {
      setTimeout(() => processInMemoryJob(queueKey, job, processorFn), outcome.delay);
    }
  }
}

module.exports = {
  getQueue,
  registerWorker,
  isRedisAvailable: () => redisAvailable,
};
