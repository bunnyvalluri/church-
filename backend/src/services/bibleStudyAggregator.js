/**
 * backend/src/services/bibleStudyAggregator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Bible Study Aggregator Service powered by Firecrawl Architecture.
 *   - Collects devotionals, theological articles, and study guides
 *   - Stores in Neon PostgreSQL (BibleStudyResource)
 *   - Exposes clean API for the public Resources page (/resources & /resources/bible-study)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const firecrawlService = require('./firecrawlService');

const STUDY_QUERIES = [
  { type: 'DEVOTIONAL', query: 'Daily Christian devotional gospel grace study', ref: 'Matthew 6:33' },
  { type: 'ARTICLE', query: 'Theological article prayer faith overcoming trials', ref: 'James 1:2-4' },
  { type: 'BIBLE_STUDY', query: 'Deep Bible study guide Romans righteousness faith', ref: 'Romans 8:28' }
];

async function runBibleStudyAggregation() {
  console.log('[BIBLE_STUDY_AGGREGATOR] Collecting devotionals & articles via Firecrawl...');
  const aggregatedResources = [];

  for (const item of STUDY_QUERIES) {
    try {
      const searchRes = await firecrawlService.searchWeb(item.query, { limit: 3 });

      if (searchRes.success && Array.isArray(searchRes.data)) {
        for (const doc of searchRes.data) {
          const title = doc.title || `${item.type} Guide`;
          const sourceUrl = doc.url || `https://resources.example.org/study-${Date.now()}`;
          const summary = doc.snippet || `Biblical reflection and study resources for growth.`;
          const bodyMd = doc.markdown || `# ${title}\n\n${summary}\n\nScripture Focus: ${item.ref}`;

          try {
            const resource = await prisma.bibleStudyResource.create({
              data: {
                resourceType: item.type,
                title,
                author: 'KCM Intelligence & Pastoral Research',
                scriptureRef: item.ref,
                summary,
                bodyMd,
                sourceUrl,
                tags: ['Faith', 'Devotional', 'Scripture', 'KCM'],
                storedInApp: true
              }
            });

            aggregatedResources.push(resource);
          } catch (dbErr) {
            console.warn('[BIBLE_STUDY_AGGREGATOR] DB store error:', dbErr.message);
          }
        }
      }
    } catch (err) {
      console.warn(`[BIBLE_STUDY_AGGREGATOR] Search failed for ${item.type}:`, err.message);
    }
  }

  return aggregatedResources;
}

async function getBibleStudyResources(resourceType = null, limit = 20) {
  const where = resourceType ? { resourceType } : {};
  return await prisma.bibleStudyResource.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

module.exports = {
  runBibleStudyAggregation,
  getBibleStudyResources
};
