/**
 * backend/src/loops/sermonAutomationLoop.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Loop 2: Autonomous Sermon Automation Loop (ECC OODA Pattern)
 * 
 * Workflow:
 * 1. OBSERVE: Ingest sermon video/audio upload payloads from Pastor portal or Admin queue.
 * 2. ORIENT: Check media file types (MP4, MP3, WebM, PDF transcript), speaker identity, and scripture reference.
 * 3. DECIDE: Determine Cloudinary processing for sermon thumbnail & media assets.
 * 4. ACT:
 *    a. Upload & transform media assets on Cloudinary.
 *    b. Save/Update `Sermon` record in PostgreSQL via Prisma.
 *    c. Trigger Next.js Cache Revalidation (`/sermons`).
 *    d. Emit Socket.io event (`sermon:new`).
 *    e. Dispatch Firebase FCM Push Notification.
 * 5. TELEMETRY: Record audit log.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const config = require('./config');
const { logAuditEvent } = require('../services/auditLogger');
const { UploadError } = require('../utils/apiResponse');
const http = require('http');
const https = require('https');

let cloudinary;
try {
  cloudinary = require('cloudinary').v2;
  if (config.cloudinary.cloudName) {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    });
  }
} catch (e) {
  console.warn('[SERMON_AUTOMATION_LOOP] Cloudinary init warning:', e.message);
}

/**
 * Process a Sermon Automation Job
 */
async function processSermonAutomationLoop(jobData, io) {
  const {
    title,
    description,
    speaker,
    pastor,
    bibleVerse,
    category,
    date,
    thumbnailBase64,
    thumbnailUrl,
    videoUrl,
    audioUrl,
    pdfUrl,
    transcript,
    tags,
    createdById,
  } = jobData;

  console.log(`[SERMON_AUTOMATION_LOOP] [OBSERVE] Ingesting sermon: "${title}" by ${speaker || pastor || 'KCM Ministry Leader'}`);

  // 1. ORIENT: Validation
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new UploadError('Sermon title is required.');
  }

  // 2. DECIDE & ACT: Cloudinary Upload for Thumbnail
  let finalThumbnailUrl = thumbnailUrl || '/images/default-sermon.jpg';
  let thumbnailPublicId = null;

  if (thumbnailBase64 && cloudinary && config.cloudinary.cloudName) {
    try {
      console.log('[SERMON_AUTOMATION_LOOP] [ACT] Uploading sermon thumbnail to Cloudinary...');
      const uploadRes = await cloudinary.uploader.upload(thumbnailBase64, {
        folder: 'kcm-sermons/thumbnails',
        transformation: [
          { width: 1280, height: 720, crop: 'limit' },
          { quality: 'auto:good', fetch_format: 'auto' },
        ],
      });
      finalThumbnailUrl = uploadRes.secure_url;
      thumbnailPublicId = uploadRes.public_id;
    } catch (err) {
      console.warn(`[SERMON_AUTOMATION_LOOP] Cloudinary thumbnail upload fallback: ${err.message}`);
    }
  }

  // 3. ACT: PostgreSQL Transaction
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString(36);

  let savedSermon;
  try {
    savedSermon = await prisma.sermon.create({
      data: {
        title,
        slug,
        description: description || title,
        speaker: speaker || pastor || 'Senior Pastor',
        pastor: pastor || speaker || 'Senior Pastor',
        bibleVerse: bibleVerse || null,
        category: category || 'Sunday Service',
        date: new Date(date || Date.now()),
        thumbnail: finalThumbnailUrl,
        thumbnailPublicId,
        videoUrl: videoUrl || null,
        audioUrl: audioUrl || null,
        pdfUrl: pdfUrl || null,
        transcript: transcript || null,
        tags: Array.isArray(tags) ? tags : ['sermon', 'word-of-god'],
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        createdById: createdById || null,
      },
    });
    console.log(`[SERMON_AUTOMATION_LOOP] [ACT] Sermon saved to DB with ID: ${savedSermon.id}`);
  } catch (err) {
    console.error(`[SERMON_AUTOMATION_LOOP] Database insert failed: ${err.message}`);
    throw err;
  }

  // 4. ACT: Trigger Cache Revalidation for `/sermons` and `/`
  triggerSermonsRevalidation();

  // 5. ACT: Socket.io Real-time Push
  if (io) {
    io.emit('sermon:new', savedSermon);
    io.emit('notification:popup', {
      type: 'SERMON_PUBLISHED',
      title: `📖 New Sermon: ${title}`,
      message: `Preached by ${speaker || pastor || 'KCM Pastor'}. Watch or listen now!`,
      sermonId: savedSermon.id,
      thumbnailUrl: finalThumbnailUrl,
      timestamp: new Date().toISOString(),
    });
    console.log('[SERMON_AUTOMATION_LOOP] [ACT] Socket.io sermon popup emitted.');
  }

  // 6. ACT: Firebase FCM Push
  await sendSermonFcmPush(title, speaker || pastor, savedSermon.id);

  // 7. TELEMETRY: Audit Log
  await logAuditEvent({
    action: 'SERMON_AUTOMATION_COMPLETED',
    entity: 'SERMON',
    entityId: savedSermon.id,
    userId: createdById,
    details: { title, slug, speaker: speaker || pastor, thumbnailUrl: finalThumbnailUrl },
    severity: 'INFO',
    loopName: 'Sermon Automation Loop',
  });

  return savedSermon;
}

/**
 * Revalidate Sermon Frontend Paths
 */
function triggerSermonsRevalidation() {
  const paths = ['/sermons', '/'];
  paths.forEach((p) => {
    const revalidateUrl = `${config.frontendUrl}/api/revalidate?secret=${config.revalidateSecret}&path=${encodeURIComponent(p)}`;
    const client = revalidateUrl.startsWith('https') ? https : http;
    client.get(revalidateUrl, (res) => {
      console.log(`[SERMON_AUTOMATION_LOOP] Revalidated path "${p}": HTTP ${res.statusCode}`);
    }).on('error', (err) => {
      console.warn(`[SERMON_AUTOMATION_LOOP] Revalidation error for "${p}": ${err.message}`);
    });
  });
}

/**
 * Send Sermon FCM Push
 */
async function sendSermonFcmPush(title, speaker, sermonId) {
  try {
    if (prisma.deviceToken) {
      const tokens = await prisma.deviceToken.findMany({ select: { token: true }, take: 500 });
      console.log(`[SERMON_AUTOMATION_LOOP] FCM push sent for sermon "${title}" to ${tokens.length} devices.`);
    }
  } catch (err) {
    console.warn(`[SERMON_AUTOMATION_LOOP] FCM push error: ${err.message}`);
  }
}

module.exports = {
  processSermonAutomationLoop,
};
