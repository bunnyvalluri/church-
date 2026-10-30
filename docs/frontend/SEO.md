# KCM Church — SEO, Metadata & Discoverability Architecture

## 1. Metadata & OpenGraph
* Canonical base URL: `https://kcmchurch.org`
* OpenGraph & Twitter Cards configured for all sermon, event, and outreach pages.
* Dynamic title template: `%s | Kingdom of Christ Ministries`.

---

## 2. Structured Data (JSON-LD)
* **Church / Place of Worship**: Configured with campus addresses, telephone (`+91 97040 90069`), and geo-coordinates.
* **Events**: `Event` schema on all `/events/*` pages detailing start date, physical location, and ticket status.
* **Articles & Sermons**: `VideoObject` / `Article` schema providing search engines with speaker, scripture passage, and duration.

---

## 3. Crawl Isolation
* `robots.ts` explicitly disallows all administrative, pastoral, member, and offline sync paths.
* Dynamic XML sitemaps: `/sitemap.xml` and `/image-sitemap.xml`.

