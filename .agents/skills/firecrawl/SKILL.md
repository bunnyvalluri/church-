---
name: firecrawl
description: Firecrawl Agent Integration Skill for web searching, scraping, crawling, and content extraction for Antigravity AI Assistant & KCM Ministries Platform.
---

# Firecrawl Agent Skill Instructions

This skill enables Antigravity and AI agents to search, scrape, crawl, and extract clean web content using Firecrawl Cloud API & local Firecrawl services.

## Firecrawl API Key Configuration
- **API Key**: `fc-7d7905a9a13247bcaa18ba4517ce0b81`
- **Base API Endpoint**: `https://api.firecrawl.dev/v1`


## API Capabilities

### 1. Scrape URL (`POST /v1/scrape`)
Scrapes a single target URL and returns clean Markdown, HTML, and metadata.
```json
{
  "url": "https://example.com",
  "formats": ["markdown", "html"],
  "onlyMainContent": true
}
```

### 2. Search Web (`POST /v1/search`)
Searches the web for articles, Christian blogs, devotionals, or NGO opportunities.
```json
{
  "query": "Christian sermon study grace redemption",
  "limit": 5
}
```

### 3. Crawl Domain (`POST /v1/crawl`)
Recursively crawls a website domain with depth and page limit.
```json
{
  "url": "https://example.org",
  "limit": 10,
  "scrapeOptions": { "formats": ["markdown"] }
}
```

### 4. Structured LLM Extraction (`POST /v1/extract`)
Extracts JSON data according to a specified schema.

## Local Platform Integration Endpoints
In the KCM Church Platform, Firecrawl intelligence endpoints are accessible via:
- `POST /api/firecrawl/scrape`: Direct URL Scrape
- `POST /api/firecrawl/sermon-research`: Sermon Research & Pastor Outline Brief
- `GET/POST /api/firecrawl/church-news`: Scrape & View Christian News Feed
- `GET/POST /api/firecrawl/bible-study`: Collect Devotionals for `/resources/bible-study`
- `POST /api/firecrawl/event-generator`: Generate Social Captions & Blog Articles
- `GET/POST /api/firecrawl/ngo-research`: Scrape NGO Grants & Welfare Opportunities
- `GET/POST /api/firecrawl/website-monitoring`: Target Site SHA256 Hash & Diff Monitoring
