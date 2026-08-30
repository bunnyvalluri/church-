/**
 * lib/schema.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Schema.org JSON-LD structured data builders for Kingdom of Christ Ministries (KCM).
 * Truthful, authoritative, connected graph representation of the church entity,
 * its branches, website, sermons, events, and breadcrumbs.
 * No keyword stuffing, no fake reviews, no invented locations.
 */

import { SITE_URL, SITE_NAME } from "./seo";
import { KCM_BRANCHES, BranchLocation } from "./locationsData";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

// ── Church / PlaceOfWorship / Primary Organization ────────────────────────────
export function churchSchema() {
  const branches = Object.values(KCM_BRANCHES);

  return {
    "@context": "https://schema.org",
    "@type": ["Church", "Organization"],
    "@id": ORGANIZATION_ID,
    name: "Kingdom of Christ Ministries",
    alternateName: [
      "KCM",
      "KCM Ministries",
      "KCM Church",
      "Kingdom of Christ Ministry",
      "Kingdom of Christ",
    ],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: `${SITE_URL}/logo.png`,
      caption: "Kingdom of Christ Ministries Official Logo",
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/pastor.png`,
    description:
      "Official website of Kingdom of Christ Ministries (KCM) — a Christ-centred church community in Hyderabad, India, led by Senior Pastor Bishop Kurra Kristhu Raju. With sanctuaries in Shapur Nagar, Subhash Nagar, and Bahadurpally, we serve through gospel preaching, worship, prayer, ministries, events, and community outreach.",
    foundingDate: "2000",
    founder: {
      "@type": "Person",
      name: "Bishop Kurra Kristhu Raju",
      jobTitle: "Senior Pastor & Founder",
      telephone: "+91-97040-90069",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla",
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
    telephone: ["+91-97040-90069", "+91-96409-43777", "+91-73964-33856"],
    email: "kingofchristministries23@gmail.com",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "05:45",
        closes: "08:30",
        description: "Sunday Morning Watch Tower Prayer (Subhash Nagar Branch)",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "08:30",
        closes: "10:30",
        description: "Sunday Second Worship Service (Subhash Nagar Branch)",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "11:00",
        closes: "13:00",
        description: "Sunday Afternoon Worship Service (Bahadurpally Branch)",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "18:00",
        closes: "21:00",
        description: "Sunday Evening Worship Service (Shapur Nagar Main Sanctuary)",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Friday",
        opens: "18:00",
        closes: "20:30",
        description: "Friday Prayer Fellowship (Shapur Nagar Main Sanctuary)",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Thursday",
        opens: "18:30",
        closes: "20:30",
        description: "Oil Anointing Prayer Service (Subhash Nagar Branch)",
      },
    ],
    hasMap: "https://maps.google.com/?q=Kingdom+of+Christ+Ministries,+15-201,+Vivekananda+Nagar,+Srinivas+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-97040-90069",
        contactType: "pastoral care and customer service",
        availableLanguage: ["English", "Telugu", "Hindi"],
        email: "kingofchristministries23@gmail.com",
      },
      {
        "@type": "ContactPoint",
        telephone: "+91-96409-43777",
        contactType: "church office",
        availableLanguage: ["Telugu", "English"],
      },
    ],
    sameAs: [
      "https://www.youtube.com/@kcmchurchshapur7107",
    ],
    areaServed: [
      {
        "@type": "City",
        name: "Hyderabad",
        addressRegion: "Telangana",
        addressCountry: "IN",
      },
      {
        "@type": "AdministrativeArea",
        name: "Telangana",
        addressCountry: "IN",
      },
    ],
    subOrganization: branches.map((b) => ({
      "@type": ["Church", "PlaceOfWorship"],
      "@id": `${SITE_URL}/locations/${b.slug}#branch`,
      name: `Kingdom of Christ Ministries — ${b.name}`,
      url: `${SITE_URL}/locations/${b.slug}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: b.address,
        addressLocality: b.locality,
        addressRegion: b.region,
        postalCode: b.postalCode,
        addressCountry: b.country,
      },
      telephone: b.primaryPhone,
    })),
  };
}

// ── WebSite schema ────────────────────────────────────────────────────────────
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "KCM Church",
    alternateName: [
      "Kingdom of Christ Ministries",
      "KCM Ministries",
      "KCM",
      "Kingdom of Christ",
    ],
    url: SITE_URL,
    description:
      "Official website of Kingdom of Christ Ministries (KCM) — faith, worship services, ministries, locations, sermons, events, prayer support, and community outreach in Hyderabad, India.",
    publisher: {
      "@id": ORGANIZATION_ID,
    },
    inLanguage: ["en-IN", "te", "hi"],
  };
}

// ── Dedicated Branch Location Schema ──────────────────────────────────────────
export function branchLocationSchema(branch: BranchLocation) {
  return {
    "@context": "https://schema.org",
    "@type": ["PlaceOfWorship", "Church"],
    "@id": `${SITE_URL}/locations/${branch.slug}#branch`,
    name: `Kingdom of Christ Ministries — ${branch.name}`,
    alternateName: [`KCM ${branch.shortName}`, `Kingdom of Christ Ministries ${branch.shortName}`],
    url: `${SITE_URL}/locations/${branch.slug}`,
    image: branch.heroImage,
    description: branch.description,
    parentOrganization: {
      "@type": "Church",
      "@id": ORGANIZATION_ID,
      name: "Kingdom of Christ Ministries",
      url: SITE_URL,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.address,
      addressLocality: branch.locality,
      addressRegion: branch.region,
      postalCode: branch.postalCode,
      addressCountry: branch.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: branch.geo.latitude,
      longitude: branch.geo.longitude,
    },
    telephone: branch.phones,
    email: branch.email,
    hasMap: branch.mapUrl,
    openingHoursSpecification: branch.services.map((srv) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: srv.day.includes("Sunday")
        ? "Sunday"
        : srv.day.includes("Friday")
        ? "Friday"
        : srv.day.includes("Thursday")
        ? "Thursday"
        : "Tuesday",
      description: `${srv.type} (${srv.time})`,
    })),
    publicAccess: true,
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
      "@id": ORGANIZATION_ID,
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
        streetAddress: "15-201, Vivekananda Nagar, Jeedimetla",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        postalCode: "500055",
        addressCountry: "IN",
      },
    },
    image: imageUrl ? [imageUrl] : [`${SITE_URL}/logo.png`],
    url: eventUrl,
    organizer: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: organizer,
      url: SITE_URL,
    },
  };
}
