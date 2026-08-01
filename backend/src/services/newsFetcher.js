/**
 * backend/src/services/newsFetcher.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated Background Cron Service for Christian, NGO, & Mission news feeds.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { runChurchNewsFetch } = require('./agentReachEngine');

async function runNewsFetchCron(io) {
  console.log('[NEWS_CRON] Executing scheduled Christian & NGO news refresh...');
  try {
    const result = await runChurchNewsFetch({ forceRefresh: true }, io);
    console.log('[NEWS_CRON] News refresh complete. Articles saved to Neon DB.');
    return result;
  } catch (err) {
    console.error('[NEWS_CRON] Error during news fetch:', err.message);
  }
}

module.exports = {
  runNewsFetchCron
};
