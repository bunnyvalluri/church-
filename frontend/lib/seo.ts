/**
 * lib/seo.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Centralised SEO helper for Kingdom of Christ Ministries (KCM).
 * Provides canonical URLs, metadata, Open Graph, and Twitter card generation.
 * All canonical URLs are HTTPS, point to the production domain, and are
 * normalised (lowercase, no trailing slash except root /).
 */

import type { Metadata } from "next";

// ── Production domain ─────────────────────────────────────────────────────────
export const SITE_URL = "https://kcmchurch.vercel.app";
export const SITE_NAME = "Kingdom of Christ Ministries";
export const SITE_SHORT_NAME = "KCM";
export const SITE_DESCRIPTION =
  "Official website of Kingdom of Christ Ministries (KCM). Discover our church, worship services, ministries, locations, sermons, events, prayer support, community programs, and ways to get involved.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

// ── Canonical URL builder ─────────────────────────────────────────────────────
export function canonicalUrl(path: string): string {
  const normalised = path === "/" ? "/" : path.replace(/\/$/, "").toLowerCase();
  return `${SITE_URL}${normalised}`;
}

// ── Core metadata factory ─────────────────────────────────────────────────────
export interface SeoConfig {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
  keywords?: string[];
  overrideFullTitle?: boolean;
}

export function constructMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noIndex = false,
  keywords = [],
  overrideFullTitle = false,
}: SeoConfig): Metadata {
  const canonical = canonicalUrl(path);
  const fullTitle = overrideFullTitle || title.includes("Kingdom of Christ Ministries")
    ? title
    : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    keywords: [
      "Kingdom of Christ Ministries",
      "KCM",
      "KCM Ministries",
      "KCM Church",
      "Kingdom of Christ",
      "Kingdom of Christ Ministry",
      "church Hyderabad",
      "church Jeedimetla",
      ...keywords,
    ],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: ogType,
      locale: "en_IN",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

// ── Page-specific metadata presets ────────────────────────────────────────────
export const PAGE_METADATA = {
  home: constructMetadata({
    title: "Kingdom of Christ Ministries | KCM",
    description:
      "Official website of Kingdom of Christ Ministries (KCM). Discover our church, worship services, ministries, locations, sermons, events, prayer support, community programs, and ways to get involved.",
    path: "/",
    overrideFullTitle: true,
    keywords: [
      "KCM Ministries",
      "KCM Church",
      "Sunday service Hyderabad",
      "Bishop Kurra Kristhu Raju",
      "Christian community Hyderabad",
    ],
  }),
  about: constructMetadata({
    title: "About Kingdom of Christ Ministries | KCM",
    description:
      "Learn about Kingdom of Christ Ministries (KCM) — our journey, vision, leadership under Senior Pastor Bishop Kurra Kristhu Raju, core Christian beliefs, and mission across Hyderabad.",
    path: "/about",
    overrideFullTitle: true,
    keywords: ["about KCM church", "Kingdom of Christ history", "KCM leadership"],
  }),
  story: constructMetadata({
    title: "Our Story",
    description:
      "Discover how Kingdom of Christ Ministries grew from a humble prayer gathering into a thriving family of faith across Shapur, Subhash Nagar, and Bahadurpally in Hyderabad.",
    path: "/about/story",
    keywords: ["KCM history", "church story Hyderabad", "Kingdom of Christ founding"],
  }),
  leadership: constructMetadata({
    title: "Leadership",
    description:
      "Meet the pastoral leadership of Kingdom of Christ Ministries — Senior Pastor Bishop Kurra Kristhu Raju and our dedicated ministry leaders serving the Hyderabad community.",
    path: "/about/leadership",
    keywords: ["Bishop Kurra Kristhu Raju", "KCM pastor", "church leadership Hyderabad"],
  }),
  beliefs: constructMetadata({
    title: "Our Beliefs",
    description:
      "Explore the foundational biblical beliefs and doctrines of Kingdom of Christ Ministries — faith in Jesus Christ, the authority of scripture, salvation, and kingdom living.",
    path: "/about/beliefs",
    keywords: ["Christian beliefs", "church doctrine", "faith Hyderabad"],
  }),
  ministries: constructMetadata({
    title: "Ministries",
    description:
      "Find your place to connect and serve at Kingdom of Christ Ministries. Discover our worship, youth, women's, men's, children's, and compassionate community ministries.",
    path: "/about/ministries",
    keywords: ["church ministries Hyderabad", "youth ministry", "women fellowship"],
  }),
  mission: constructMetadata({
    title: "Mission & Vision",
    description:
      "The mission of Kingdom of Christ Ministries is to know Christ and make Him known through passionate worship, discipleship, evangelism, and community transformation.",
    path: "/about/mission",
    keywords: ["church mission vision", "KCM mission Hyderabad"],
  }),
  pastorMessage: constructMetadata({
    title: "Pastor's Message",
    description:
      "A personal pastoral message from Senior Pastor Bishop Kurra Kristhu Raju, founder of Kingdom of Christ Ministries, sharing God's heart and guidance for your life.",
    path: "/about/pastor-message",
    keywords: ["pastor message", "Bishop Kurra Kristhu Raju message"],
  }),
  sermons: constructMetadata({
    title: "Sermons",
    description:
      "Watch and listen to gospel-centred sermons from Kingdom of Christ Ministries. Life-changing video messages by Bishop Kurra Kristhu Raju and guest ministers in Telugu and English.",
    path: "/sermons",
    keywords: ["KCM sermons", "gospel messages Telugu", "church sermons Hyderabad", "Bishop Kurra sermons"],
  }),
  events: constructMetadata({
    title: "Church Events",
    description:
      "Explore upcoming worship services, prayer vigils, revival meetings, youth gatherings, and outreach events at Kingdom of Christ Ministries in Hyderabad.",
    path: "/events",
    keywords: ["church events Hyderabad", "KCM events", "Christian events Hyderabad"],
  }),
  prayer: constructMetadata({
    title: "Prayer Request",
    description:
      "Submit your prayer request to Kingdom of Christ Ministries. Our faithful intercessory prayer team prays daily for healing, breakthrough, peace, and spiritual growth.",
    path: "/prayer",
    keywords: ["prayer request Hyderabad", "KCM prayer", "intercessory prayer church"],
  }),
  getInvolved: constructMetadata({
    title: "Get Involved",
    description:
      "Get connected with the community at Kingdom of Christ Ministries. Join small groups, serve in volunteer ministries, and grow in your walk with God.",
    path: "/get-involved",
    keywords: ["get involved church", "join church community", "volunteer KCM"],
  }),
  smallGroups: constructMetadata({
    title: "Small Groups",
    description:
      "Join a small group Bible study with Kingdom of Christ Ministries. Build authentic Christian fellowship, study God's word, and support one another across Hyderabad.",
    path: "/get-involved/small-groups",
    keywords: ["small groups Hyderabad", "Bible study group", "church community"],
  }),
  volunteer: constructMetadata({
    title: "Volunteer",
    description:
      "Use your God-given talents to serve at Kingdom of Christ Ministries. Explore volunteer opportunities in worship, media, sound, ushering, children's ministry, and community outreach.",
    path: "/get-involved/volunteer",
    keywords: ["volunteer church Hyderabad", "KCM volunteer", "church service opportunities"],
  }),
  serve: constructMetadata({
    title: "Serve with Us",
    description:
      "Discover purposeful ways to serve God, love people, and make a meaningful difference with Kingdom of Christ Ministries in Hyderabad.",
    path: "/get-involved/serve",
    keywords: ["serve church Hyderabad", "community service KCM"],
  }),
  membership: constructMetadata({
    title: "Membership",
    description:
      "Become a registered member of Kingdom of Christ Ministries. Deepen your spiritual commitment, connect with our church family, and access member resources.",
    path: "/membership",
    keywords: ["church membership Hyderabad", "KCM membership", "join church Hyderabad"],
  }),
  locations: constructMetadata({
    title: "KCM Church Locations",
    description:
      "Find Kingdom of Christ Ministries branch locations across Hyderabad. View addresses, service schedules, Google Maps directions, and contact details for Shapur, Subhash Nagar, and Bahadurpally.",
    path: "/locations",
    keywords: [
      "KCM locations",
      "church Jeedimetla Hyderabad",
      "church Bahadurpally",
      "Sunday service timings Hyderabad",
      "Shapur Nagar church",
    ],
  }),
  shapurNagar: constructMetadata({
    title: "Shapur Nagar Main Sanctuary",
    description:
      "Kingdom of Christ Ministries Shapur Nagar Sanctuary in Jeedimetla, Hyderabad. Friday prayer fellowship (6:00 PM) and Sunday evening worship service (6:00 PM). Address: 15-201, Vivekananda Nagar.",
    path: "/locations/shapur-nagar",
    keywords: ["Shapur Nagar church", "Jeedimetla church", "Kingdom of Christ Shapur"],
  }),
  subhashNagar: constructMetadata({
    title: "Subhash Nagar Branch",
    description:
      "Kingdom of Christ Ministries Subhash Nagar Branch in Jeedimetla, Hyderabad. Sunday morning Watch Tower prayer (5:45 AM), second worship (8:30 AM), and Thursday Oil Anointing service (6:30 PM).",
    path: "/locations/subhash-nagar",
    keywords: ["Subhash Nagar church", "Watch Tower prayer Hyderabad", "Jeedimetla church"],
  }),
  bahadurpally: constructMetadata({
    title: "Bahadurpally Branch",
    description:
      "Kingdom of Christ Ministries Bahadurpally Branch. Sunday afternoon worship service (11:00 AM – 2:00 PM) and monthly 2nd Tuesday special intercession in North Hyderabad.",
    path: "/locations/bahadurpally",
    keywords: ["Bahadurpally church", "Gandimaisamma church", "Kingdom of Christ Bahadurpally"],
  }),
  gallery: constructMetadata({
    title: "KCM Gallery",
    description:
      "Explore photo highlights from worship services, baptisms, conventions, youth festivals, and outreach events at Kingdom of Christ Ministries in Hyderabad.",
    path: "/gallery",
    keywords: ["KCM gallery", "church photos Hyderabad", "Kingdom of Christ photos"],
  }),
  resources: constructMetadata({
    title: "Resources",
    description:
      "Access spiritual growth resources from Kingdom of Christ Ministries — sermon archives, Bible study guides, and ministry media to help equip your faith.",
    path: "/resources",
    keywords: ["church resources Hyderabad", "Bible study materials", "KCM media"],
  }),
  bibleStudy: constructMetadata({
    title: "Bible Study Guides",
    description:
      "Download weekly Bible study guides, scriptures, and teaching notes from Kingdom of Christ Ministries to support personal devotion and group study.",
    path: "/resources/bible-study",
    keywords: ["Bible study guides", "Telugu Bible study", "Christian teaching notes"],
  }),
  media: constructMetadata({
    title: "Media Library",
    description:
      "Browse the multimedia library of Kingdom of Christ Ministries — sermon recordings, worship clips, special event videos, and photographs.",
    path: "/resources/media",
    keywords: ["KCM media library", "worship recordings", "church videos"],
  }),
  ngo: constructMetadata({
    title: "KCM NGO",
    description:
      "Kingdom of Christ Ministries Society is dedicated to humanitarian service across Hyderabad — providing food relief, education support, medical care, and assistance to widows and orphans.",
    path: "/ngo",
    keywords: ["KCM Society NGO", "church outreach Hyderabad", "community welfare Jeedimetla"],
  }),
  ngoProjects: constructMetadata({
    title: "NGO Projects | Kingdom of Christ Ministries",
    description:
      "Discover the ongoing community welfare, disaster relief, education, and humanitarian projects undertaken by Kingdom of Christ Ministries Society in Telangana.",
    path: "/ngo/projects",
    keywords: ["KCM NGO projects", "church welfare Hyderabad", "social service projects"],
  }),
  ngoGallery: constructMetadata({
    title: "NGO Outreach Gallery | Kingdom of Christ Ministries",
    description:
      "Visual documentation of humanitarian missions, food drives, and community welfare initiatives by Kingdom of Christ Ministries Society.",
    path: "/ngo/gallery",
    keywords: ["KCM outreach gallery", "NGO Hyderabad photos"],
  }),
  ngoVideos: constructMetadata({
    title: "NGO Outreach Videos | Kingdom of Christ Ministries",
    description:
      "Video stories and reports highlighting community impact and life transformations through Kingdom of Christ Ministries Society's outreach work.",
    path: "/ngo/videos",
    keywords: ["KCM NGO videos", "church outreach videos Hyderabad"],
  }),
  ngoVolunteers: constructMetadata({
    title: "Volunteer with KCM Society | Kingdom of Christ Ministries",
    description:
      "Join Kingdom of Christ Ministries Society as a humanitarian volunteer to serve vulnerable families, elderly citizens, and children in need.",
    path: "/ngo/volunteers",
    keywords: ["KCM Society volunteer", "NGO volunteer Hyderabad"],
  }),
  contact: constructMetadata({
    title: "Contact Us",
    description:
      "Get in touch with Kingdom of Christ Ministries. Reach us via phone (+91 97040 90069), email, or visit our church sanctuaries in Jeedimetla and Bahadurpally, Hyderabad.",
    path: "/contact",
    keywords: ["KCM contact", "church Hyderabad phone", "contact church Jeedimetla"],
  }),
  give: constructMetadata({
    title: "Give & Support",
    description:
      "Support the mission, gospel preaching, and charitable community outreach of Kingdom of Christ Ministries through secure online tithes and offerings.",
    path: "/give",
    keywords: ["church donation Hyderabad", "KCM give", "support KCM ministry"],
  }),
  privacy: constructMetadata({
    title: "Privacy Policy",
    description:
      "Read the official Privacy Policy of Kingdom of Christ Ministries to learn how we protect your personal information and uphold data security.",
    path: "/privacy",
  }),
  terms: constructMetadata({
    title: "Terms of Service",
    description:
      "Review the Terms of Service governing the use of the Kingdom of Christ Ministries website, media platforms, and member portals.",
    path: "/terms",
  }),

  // ── Private pages — strictly noindex / nofollow ─────────────────────────────
  login: constructMetadata({
    title: "Member Login",
    description: "Sign in to Kingdom of Christ Ministries member and leader portal.",
    path: "/login",
    noIndex: true,
  }),
  register: constructMetadata({
    title: "Register Account",
    description: "Create a Kingdom of Christ Ministries member account.",
    path: "/register",
    noIndex: true,
  }),
  forgotPassword: constructMetadata({
    title: "Forgot Password",
    description: "Reset your password for Kingdom of Christ Ministries portal.",
    path: "/forgot-password",
    noIndex: true,
  }),
};
