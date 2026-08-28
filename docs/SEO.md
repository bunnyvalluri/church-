# Search Engine Optimization (SEO) & Structured Data

## Purpose
This document specifies the Search Engine Optimization (SEO) architecture, Next.js metadata configurations, OpenGraph social sharing tags, dynamic XML sitemaps, and JSON-LD structured data schemas implemented across the Kingdom of Christ Ministries web platform.

## Scope
Covers all public pages (`/`, `/about`, `/events`, `/sermons`, `/locations`, `/ngo`, `/give`) and dynamic detail routes (`/events/[slug]`, `/sermons/[id]`, `/locations/[slug]`).

## Status
> Status: Implemented

---

## 1. Next.js 14 Metadata API Architecture

Page metadata is defined statically or generated dynamically using the Next.js `generateMetadata` API:

```typescript
// app/events/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);
  if (!event) return { title: "Event Not Found | KCM Church" };

  return {
    title: `${event.title} | Kingdom of Christ Ministries`,
    description: event.shortDescription || event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.shortDescription,
      url: `https://kcmchurch.org/events/${event.slug}`,
      siteName: "Kingdom of Christ Ministries",
      images: [
        {
          url: event.image || "https://kcmchurch.org/logo.png",
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.shortDescription,
      images: [event.image || "https://kcmchurch.org/logo.png"],
    },
  };
}
```

---

## 2. JSON-LD Structured Data Schemas

The platform embeds rich Google-compliant JSON-LD structured data to maximize discoverability and rich snippet rankings:

### 2.1 Church Organization Schema (`app/layout.tsx`)
```json
{
  "@context": "https://schema.org",
  "@type": "Church",
  "name": "Kingdom of Christ Ministries",
  "url": "https://kcmchurch.org",
  "logo": "https://kcmchurch.org/logo.png",
  "image": "https://kcmchurch.org/pastor.png",
  "telephone": "+91 96409 43777",
  "email": "kingofchristministries23@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla",
    "addressLocality": "Hyderabad",
    "addressRegion": "Telangana",
    "postalCode": "500055",
    "addressCountry": "IN"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday"],
      "opens": "09:00",
      "closes": "12:30"
    }
  ]
}
```

### 2.2 Event Schema (`app/events/[slug]/page.tsx`)
Embeds `schema.org/Event` with `startDate`, `endDate`, `eventStatus`, `eventAttendanceMode`, and `location` parameters.

### 2.3 Sermon & Video Schema (`app/sermons/[id]/page.tsx`)
Embeds `schema.org/VideoObject` and `AudioObject` with `uploadDate`, `duration`, `embedUrl`, and `author` (preacher).

---

## 3. Dynamic Sitemap & Robots.txt

- **`public/robots.txt`**: Declares search engine crawling rules, allowing Googlebot and Bingbot to index public pages while disallowing private staff portals (`/admin/`, `/pastor/`, `/member/`).
- **Dynamic Sitemap Route (`app/sitemap.ts`)**: Automatically fetches public events, sermons, and branch locations from PostgreSQL and outputs a standardized `sitemap.xml` with `<lastmod>` and `<changefreq>` tags.

---

## 4. Local SEO for Church Branches

Each branch page (`/locations/[slug]`) incorporates localized geo-tags, Google Maps place IDs, interactive directions, and contact phone numbers for optimal regional search rankings in Hyderabad and Telangana.

---

## 5. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| OpenGraph preview image not showing on WhatsApp/Facebook | Image URL is relative (e.g. `/events/banner.jpg`) or missing dimensions | Always supply absolute HTTPS URLs (`https://res.cloudinary.com/...`) with explicit `width: 1200, height: 630`. |
| Google Rich Results test warns of missing fields in Event schema | Missing `location.address` or `organizer` in database | Provide fallback organization defaults in `generateJsonLd()` helpers. |

---

## Security Considerations
- Private member names and confidential prayer submissions are strictly excluded from public sitemaps and search indexing.

## Related Documentation
- [Frontend.md](Frontend.md) — App Router setup.
- [Routing.md](Routing.md) — Route structure.
- [Performance.md](Performance.md) — Core Web Vitals optimization.
