/**
 * backend/src/services/ngoResearchEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * NGO Research Engine powered by Firecrawl Architecture.
 *   - Scrapes NGO opportunities, grant sources, and community programs
 *   - Deduplicates and stores in Neon PostgreSQL (NgoOpportunity)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const firecrawlService = require('./firecrawlService');

const NGO_SEARCH_QUERIES = [
  { type: 'GRANT', query: 'faith based NGO community grant opportunities 2026' },
  { type: 'COMMUNITY_PROGRAM', query: 'church community welfare youth program grant' },
  { type: 'PARTNERSHIP', query: 'NGO outreach partnership global humanitarian foundation' }
];

async function scrapeNgoOpportunities() {
  console.log('[NGO_RESEARCH] Scraping NGO opportunities via Firecrawl...');
  const opportunities = [];

  for (const q of NGO_SEARCH_QUERIES) {
    try {
      const searchRes = await firecrawlService.searchWeb(q.query, { limit: 3 });

      if (searchRes.success && Array.isArray(searchRes.data)) {
        for (const item of searchRes.data) {
          const organization = item.title ? item.title.split('-')[0].trim() : 'Global NGO Network';
          const title = item.title || 'Community Grant & Partnership Opportunity';
          const linkUrl = item.url || `https://ngo.example.org/grant-${Date.now()}`;
          const description = item.snippet || item.markdown?.slice(0, 400) || 'Community partnership program to support local welfare initiatives.';

          try {
            const opp = await prisma.ngoOpportunity.upsert({
              where: { linkUrl },
              update: {
                title,
                description,
                scrapedAt: new Date()
              },
              create: {
                organization,
                title,
                opportunityType: q.type,
                description,
                location: 'Global / Regional Outreach',
                linkUrl,
                deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days out
                tags: ['Outreach', 'Grant', 'Community', 'KCM NGO']
              }
            });
            opportunities.push(opp);
          } catch (dbErr) {
            console.warn('[NGO_RESEARCH] DB Store error:', dbErr.message);
          }
        }
      }
    } catch (err) {
      console.warn(`[NGO_RESEARCH] Scrape error for query "${q.query}":`, err.message);
    }
  }

  return opportunities;
}

async function getNgoOpportunities(type = null, limit = 20) {
  const where = type ? { opportunityType: type } : {};
  return await prisma.ngoOpportunity.findMany({
    where,
    orderBy: { scrapedAt: 'desc' },
    take: limit
  });
}

module.exports = {
  scrapeNgoOpportunities,
  getNgoOpportunities
};
