/**
 * backend/src/services/websiteMonitorEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Website Monitoring Engine powered by Firecrawl Architecture.
 *   - Tracks registered web targets
 *   - Calculates SHA256 content hashes to detect change
 *   - Sends Firebase FCM Push Notifications & Socket.io events on content change
 *   - Logs snapshots in Neon PostgreSQL (WebsiteMonitorLog)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const firecrawlService = require('./firecrawlService');
const fcmService = require('./fcmService');

async function addWebsiteTarget(siteName, targetUrl, checkFrequency = 'HOURLY', cssSelector = '') {
  return await prisma.websiteMonitorTarget.upsert({
    where: { targetUrl },
    update: {
      siteName,
      checkFrequency,
      cssSelector,
      isActive: true
    },
    create: {
      siteName,
      targetUrl,
      checkFrequency,
      cssSelector,
      isActive: true
    }
  });
}

async function checkWebsiteTarget(target, io = null) {
  console.log(`[WEBSITE_MONITOR] Checking website target: ${target.siteName} (${target.targetUrl})`);

  // Step 1: Scrape target via Firecrawl
  const scrapeRes = await firecrawlService.scrapeUrl(target.targetUrl, { onlyMainContent: true });

  if (!scrapeRes.success) {
    console.warn(`[WEBSITE_MONITOR] Scrape failed for ${target.targetUrl}: ${scrapeRes.error}`);
    return null;
  }

  const markdownContent = scrapeRes.data?.markdown || '';
  const currentHash = firecrawlService.computeContentHash(markdownContent);

  const previousHash = target.lastHash;
  const changeDetected = Boolean(previousHash && previousHash !== currentHash);

  let diffSummary = null;
  let notificationSent = false;

  if (changeDetected) {
    diffSummary = `Content change detected on ${target.siteName} at ${new Date().toLocaleString()}. Content hash shifted from ${previousHash.slice(0, 8)}... to ${currentHash.slice(0, 8)}...`;
    console.log(`[WEBSITE_MONITOR] CHANGE DETECTED on ${target.siteName}! Sending notifications...`);

    // A. Send FCM Push Notification
    try {
      if (fcmService && typeof fcmService.sendTopicNotification === 'function') {
        await fcmService.sendTopicNotification('website_monitoring', {
          title: `Site Update: ${target.siteName}`,
          body: `Content updated on monitored website. Click to review.`,
          data: { url: target.targetUrl, siteName: target.siteName }
        });
        notificationSent = true;
      }
    } catch (fcmErr) {
      console.warn('[WEBSITE_MONITOR] FCM Notification error:', fcmErr.message);
    }

    // B. Socket.io Realtime Broadcast
    if (io) {
      try {
        io.emit('website:content_changed', {
          targetId: target.id,
          siteName: target.siteName,
          targetUrl: target.targetUrl,
          diffSummary,
          checkedAt: new Date().toISOString()
        });
      } catch (e) {}
    }
  }

  // Step 2: Update Target Status & Record Log
  await prisma.websiteMonitorTarget.update({
    where: { id: target.id },
    data: {
      lastHash: currentHash,
      lastContent: markdownContent.slice(0, 3000),
      lastCheckedAt: new Date()
    }
  });

  const log = await prisma.websiteMonitorLog.create({
    data: {
      targetId: target.id,
      changeDetected,
      diffSummary,
      snapshotHash: currentHash,
      notificationSent
    }
  });

  return { target, log, changeDetected };
}

async function runAllWebsiteMonitors(io = null) {
  const activeTargets = await prisma.websiteMonitorTarget.findMany({
    where: { isActive: true }
  });

  console.log(`[WEBSITE_MONITOR] Running monitor sweep across ${activeTargets.length} active targets...`);
  const results = [];

  for (const target of activeTargets) {
    try {
      const res = await checkWebsiteTarget(target, io);
      if (res) results.push(res);
    } catch (err) {
      console.warn(`[WEBSITE_MONITOR] Target error for ${target.siteName}:`, err.message);
    }
  }

  return results;
}

async function getWebsiteTargets() {
  return await prisma.websiteMonitorTarget.findMany({
    include: {
      logs: {
        orderBy: { checkedAt: 'desc' },
        take: 5
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

module.exports = {
  addWebsiteTarget,
  checkWebsiteTarget,
  runAllWebsiteMonitors,
  getWebsiteTargets
};
