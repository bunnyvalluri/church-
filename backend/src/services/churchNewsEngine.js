/**
 * backend/src/services/churchNewsEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Church News Feed Engine powered by Firecrawl Architecture.
 *   - Scrapes Christian news outlets & ministry updates
 *   - Deduplicates and stores in Neon Postgres (ChurchNewsItem)
 *   - Emits Socket.io realtime news feed updates to admin dashboard
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const firecrawlService = require('./firecrawlService');

const DEFAULT_NEWS_SOURCES = [
  { name: 'Christian News Network', category: 'CHRISTIAN_NEWS', query: 'Christian church news ministry update' },
  { name: 'Global Mission Bulletin', category: 'MINISTRY_UPDATE', query: 'Christian missionary news global outreach' },
  { name: 'Denominational Press', category: 'DENOMINATIONAL', query: 'Evangelical church conference announcement' }
];

async function scrapeChurchNews(io = null) {
  console.log('[CHURCH_NEWS] Executing Firecrawl Church News Scrape workflow...');

  const scrapedItems = [];

  for (const source of DEFAULT_NEWS_SOURCES) {
    try {
      const searchRes = await firecrawlService.searchWeb(source.query, { limit: 3 });

      if (searchRes.success && Array.isArray(searchRes.data)) {
        for (const item of searchRes.data) {
          const title = item.title || 'Church Update';
          const sourceUrl = item.url || `https://news.example.org/${Date.now()}`;
          const summary = item.snippet || item.markdown?.slice(0, 300) || 'Latest ministry news and Christian updates.';

          try {
            const article = await prisma.churchNewsItem.upsert({
              where: { sourceUrl },
              update: {
                title,
                summary,
                category: source.category,
                fetchedAt: new Date()
              },
              create: {
                category: source.category,
                title,
                sourceName: source.name,
                sourceUrl,
                summary,
                contentMd: item.markdown || summary,
                imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=800',
                publishedAt: new Date()
              }
            });

            scrapedItems.push(article);
          } catch (dbErr) {
            console.warn('[CHURCH_NEWS] Upsert error:', dbErr.message);
          }
        }
      }
    } catch (err) {
      console.warn(`[CHURCH_NEWS] Source scrape error for ${source.name}:`, err.message);
    }
  }

  // Realtime Socket.io broadcast to admin dashboard
  if (io && scrapedItems.length > 0) {
    try {
      io.emit('church:news_updated', {
        count: scrapedItems.length,
        items: scrapedItems.slice(0, 5),
        timestamp: new Date().toISOString()
      });
    } catch (e) {}
  }

  return scrapedItems;
}

async function getChurchNews(category = null, limit = 20) {
  const where = category ? { category } : {};
  return await prisma.churchNewsItem.findMany({
    where,
    orderBy: { fetchedAt: 'desc' },
    take: limit
  });
}

module.exports = {
  scrapeChurchNews,
  getChurchNews
};
