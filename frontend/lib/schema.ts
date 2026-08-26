/**
 * lib/schema.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Schema.org JSON-LD structured data builders for Kingdom of Christ Ministries.
 * All data is based on verified, publicly available organization information.
 * No fake reviews, ratings, or invented locations.
 */

import { SITE_URL, SITE_NAME } from "./seo";

// ── Church / PlaceOfWorship / Organization ────────────────────────────────────
export function churchSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Church", "Organization"],
    "@id": `${SITE_URL}/#organization`,
    name: "Kingdom of Christ Ministries",
    alternateName: ["KCM", "KCM Church", "Kingdom of Christ Ministries India", "KCM Ministries"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/pastor.png`,
    description:
      "Kingdom of Christ Ministries is a Christ-centred church community in Hyderabad, India, led by Senior Pastor Bishop Kurra Kristhu Raju. With branches in Jeedimetla and Bahadurpally, we serve through worship, prayer, sermons, ministries, and community outreach.",
    foundingDate: "2000",
    founder: {
      "@type": "Person",
      name: "Bishop Kurra Kristhu Raju",
      jobTitle: "Senior Pastor & Founder",
      telephone: "+91-97040-90069",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Plot No. 18, Sri Sai Nagar, Pipeline Road, Jeedimetla",
      addressLocality: "Hyderabad",
      addressRegion: "Telangana",
      postalCode: "500055",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 17.5186,
      longitude: 78.4487,
    },
    telephone: ["+91-97040-90069", "+91-96409-43777"],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "05:45",
        closes: "08:30",
        description: "Sunday Worship Service — Jeedimetla Branch",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "11:00",
        closes: "14:00",
        description: "Sunday Worship Service — Bahadurpally Branch",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Wednesday",
        opens: "18:00",
        closes: "19:30",
        description: "Prayer Meeting",
      },
    ],
    hasMap: "https://maps.google.com/?q=17.5186,78.4487",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-97040-90069",
      contactType: "customer service",
      availableLanguage: ["English", "Telugu", "Hindi"],
    },
    sameAs: [],
    areaServed: {
      "@type": "City",
      name: "Hyderabad",
      addressRegion: "Telangana",
      addressCountry: "IN",
    },
  };
}

// ── WebSite schema ────────────────────────────────────────────────────────────
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: "KCM Church",
    url: SITE_URL,
    description:
      "Official website of Kingdom of Christ Ministries — faith, worship, sermons, prayer, events, and community in Hyderabad, India.",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    inLanguage: ["en-IN", "te", "hi"],
  };
}

// ── BreadcrumbList schema ─────────────────────────────────────────────────────
export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ── VideoObject schema (for sermon pages) ────────────────────────────────────
export function sermonVideoSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
  duration,
  speaker,
}: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl: string;
  duration?: string;
  speaker?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl,
    uploadDate,
    contentUrl,
    embedUrl: contentUrl,
    duration: duration || "PT45M",
    author: {
      "@type": "Person",
      name: speaker || "Bishop Kurra Kristhu Raju",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

// ── Event schema ──────────────────────────────────────────────────────────────
export function eventSchema({
  name,
  description,
  startDate,
  endDate,
  location,
  imageUrl,
  eventUrl,
  organizer = SITE_NAME,
}: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  imageUrl?: string;
  eventUrl: string;
  organizer?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description,
    startDate,
    endDate: endDate || startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: location || "Kingdom of Christ Ministries",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Jeedimetla, Hyderabad",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        addressCountry: "IN",
      },
    },
    image: imageUrl ? [imageUrl] : [`${SITE_URL}/logo.png`],
    url: eventUrl,
    organizer: {
      "@type": "Organization",
      name: organizer,
      url: SITE_URL,
    },
  };
}
