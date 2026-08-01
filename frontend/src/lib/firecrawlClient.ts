/**
 * frontend/src/lib/firecrawlClient.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Frontend client helper for Firecrawl Content Intelligence Platform
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface SermonSummary {
  id: string;
  topic: string;
  scriptureRef?: string;
  summaryText: string;
  keyTakeaways: string[];
  theologicalThemes: string[];
  sermonOutline: Array<{ section: string; point: string; description: string }>;
  scrapedSources: Array<{ title: string; url: string; snippet: string }>;
  createdAt: string;
}

export interface ChurchNews {
  id: string;
  category: string;
  title: string;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  contentMd?: string;
  imageUrl?: string;
  publishedAt?: string;
  fetchedAt: string;
}

export interface BibleStudyItem {
  id: string;
  resourceType: string;
  title: string;
  author?: string;
  scriptureRef?: string;
  summary?: string;
  bodyMd: string;
  sourceUrl: string;
  tags: string[];
  createdAt: string;
}

export interface EventGenResult {
  id: string;
  eventId?: string;
  topic: string;
  socialCaptions: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    whatsapp?: string;
  };
  blogTitle: string;
  blogMarkdown: string;
  bannerImageUrl?: string;
  createdAt: string;
}

export interface NgoOpp {
  id: string;
  organization: string;
  title: string;
  opportunityType: string;
  description: string;
  location?: string;
  linkUrl: string;
  deadline?: string;
  scrapedAt: string;
}

export interface MonitorTarget {
  id: string;
  siteName: string;
  targetUrl: string;
  checkFrequency: string;
  lastHash?: string;
  lastContent?: string;
  isActive: boolean;
  lastCheckedAt?: string;
  logs?: Array<{
    id: string;
    changeDetected: boolean;
    diffSummary?: string;
    checkedAt: string;
  }>;
}

export async function runSermonResearch(topic: string, scriptureRef?: string): Promise<{ success: boolean; summary: SermonSummary }> {
  const res = await fetch(`${BACKEND_URL}/api/firecrawl/sermon-research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, scriptureRef })
  });
  return res.json();
}

export async function fetchChurchNews(category?: string): Promise<{ success: boolean; articles: ChurchNews[] }> {
  const url = category ? `${BACKEND_URL}/api/firecrawl/church-news?category=${category}` : `${BACKEND_URL}/api/firecrawl/church-news`;
  const res = await fetch(url);
  return res.json();
}

export async function triggerChurchNewsScrape(): Promise<{ success: boolean; articles: ChurchNews[] }> {
  const res = await fetch(`${BACKEND_URL}/api/firecrawl/church-news/scrape`, { method: 'POST' });
  return res.json();
}

export async function fetchBibleStudyResources(type?: string): Promise<{ success: boolean; resources: BibleStudyItem[] }> {
  const url = type ? `${BACKEND_URL}/api/firecrawl/bible-study?type=${type}` : `${BACKEND_URL}/api/firecrawl/bible-study`;
  const res = await fetch(url);
  return res.json();
}

export async function triggerBibleStudyAggregate(): Promise<{ success: boolean; resources: BibleStudyItem[] }> {
  const res = await fetch(`${BACKEND_URL}/api/firecrawl/bible-study/aggregate`, { method: 'POST' });
  return res.json();
}

export async function generateEventContent(topic: string, eventId?: string): Promise<{ success: boolean; result: EventGenResult }> {
  const res = await fetch(`${BACKEND_URL}/api/firecrawl/event-generator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, eventId })
  });
  return res.json();
}

export async function fetchNgoOpportunities(type?: string): Promise<{ success: boolean; opportunities: NgoOpp[] }> {
  const url = type ? `${BACKEND_URL}/api/firecrawl/ngo-research?type=${type}` : `${BACKEND_URL}/api/firecrawl/ngo-research`;
  const res = await fetch(url);
  return res.json();
}

export async function triggerNgoScrape(): Promise<{ success: boolean; opportunities: NgoOpp[] }> {
  const res = await fetch(`${BACKEND_URL}/api/firecrawl/ngo-research/scrape`, { method: 'POST' });
  return res.json();
}

export async function fetchWebsiteTargets(): Promise<{ success: boolean; targets: MonitorTarget[] }> {
  const res = await fetch(`${BACKEND_URL}/api/firecrawl/website-monitoring`);
  return res.json();
}

export async function addWebsiteTarget(siteName: string, targetUrl: string, checkFrequency = 'HOURLY'): Promise<{ success: boolean; target: MonitorTarget }> {
  const res = await fetch(`${BACKEND_URL}/api/firecrawl/website-monitoring/targets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteName, targetUrl, checkFrequency })
  });
  return res.json();
}

export async function triggerWebsiteCheck(): Promise<{ success: boolean; results: any[] }> {
  const res = await fetch(`${BACKEND_URL}/api/firecrawl/website-monitoring/check`, { method: 'POST' });
  return res.json();
}
