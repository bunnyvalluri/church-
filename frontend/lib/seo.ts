/**
 * lib/seo.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Centralised SEO helper for Kingdom of Christ Ministries.
 * Provides canonical URLs, metadata, Open Graph, and Twitter card generation.
 * All canonical URLs are HTTPS, point to the production domain, and are
 * normalised (lowercase, no trailing slash except root /).
 */

import type { Metadata } from "next";

// ── Production domain ─────────────────────────────────────────────────────────
export const SITE_URL = "https://kcmchurch.vercel.app";
export const SITE_NAME = "Kingdom of Christ Ministries";
export const SITE_DESCRIPTION =
  "Kingdom of Christ Ministries — a Christ-centred church community in Jeedimetla & Bahadurpally, Hyderabad. Worship, sermons, prayer, ministries, events and outreach.";
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
}

export function constructMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noIndex = false,
  keywords = [],
}: SeoConfig): Metadata {
  const canonical = canonicalUrl(path);
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    keywords: [
      "Kingdom of Christ Ministries",
      "KCM church",
      "church Hyderabad",
      "Jeedimetla church",
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
    title: "Faith, Worship & Community in Hyderabad",
    description:
      "Welcome to Kingdom of Christ Ministries — a Christ-centred church in Jeedimetla & Bahadurpally, Hyderabad. Join us for Sunday worship, sermons, prayer meetings, ministries, and community outreach.",
    path: "/",
    keywords: ["KCM Ministries", "Sunday service Hyderabad", "Christian community Hyderabad"],
  }),
  about: constructMetadata({
    title: "About Us",
    description:
      "Learn about Kingdom of Christ Ministries — our story, vision, leadership under Bishop Kurra Kristhu Raju, core beliefs, and ministry goals in Hyderabad.",
    path: "/about",
    keywords: ["about KCM church", "Kingdom of Christ history", "KCM leadership"],
  }),
  story: constructMetadata({
    title: "Our Story",
    description:
      "Discover how Kingdom of Christ Ministries grew from a small prayer group to a vibrant community serving thousands in Hyderabad across Jeedimetla and Bahadurpally.",
    path: "/about/story",
    keywords: ["KCM history", "church story Hyderabad"],
  }),
  leadership: constructMetadata({
    title: "Leadership",
    description:
      "Meet the leaders of Kingdom of Christ Ministries — Senior Pastor Bishop Kurra Kristhu Raju and our dedicated ministry team guiding the church community.",
    path: "/about/leadership",
    keywords: ["Bishop Kurra Kristhu Raju", "KCM pastor", "church leadership Hyderabad"],
  }),
  beliefs: constructMetadata({
    title: "Our Beliefs",
    description:
      "Explore the core Christian beliefs and doctrines that guide Kingdom of Christ Ministries — faith, scripture, salvation, baptism, and community.",
    path: "/about/beliefs",
    keywords: ["Christian beliefs", "church doctrine", "faith Hyderabad"],
  }),
  ministries: constructMetadata({
    title: "Ministries",
    description:
      "Find your place to serve and grow at Kingdom of Christ Ministries. Explore worship, youth, women's, men's, children's, and community outreach ministries.",
    path: "/about/ministries",
    keywords: ["church ministries Hyderabad", "youth ministry", "women fellowship"],
  }),
  mission: constructMetadata({
    title: "Mission & Vision",
    description:
      "The mission of Kingdom of Christ Ministries is to know Christ and make Him known in Hyderabad and beyond — through worship, evangelism, and compassionate service.",
    path: "/about/mission",
    keywords: ["church mission vision", "KCM mission Hyderabad"],
  }),
  pastorMessage: constructMetadata({
    title: "Pastor's Message",
    description:
      "A personal word from Senior Pastor Bishop Kurra Kristhu Raju, founder of Kingdom of Christ Ministries, sharing the heart and vision for God's people.",
    path: "/about/pastor-message",
    keywords: ["pastor message", "Bishop Kurra Kristhu Raju message"],
  }),
  sermons: constructMetadata({
    title: "Sermons & Messages",
    description:
      "Watch and listen to powerful sermons from Kingdom of Christ Ministries. Browse our collection of life-changing gospel messages by Bishop Kurra Kristhu Raju and church ministers.",
    path: "/sermons",
    keywords: ["KCM sermons", "gospel messages Telugu", "church sermons Hyderabad", "Bishop Kurra sermons"],
  }),
  events: constructMetadata({
    title: "Upcoming Events",
    description:
      "Stay connected with upcoming events at Kingdom of Christ Ministries — prayer meetings, worship nights, community outreach, youth gatherings, and special services in Hyderabad.",
    path: "/events",
    keywords: ["church events Hyderabad", "KCM events", "Christian events Hyderabad"],
  }),
  prayer: constructMetadata({
    title: "Prayer Requests",
    description:
      "Submit your prayer request to Kingdom of Christ Ministries. Our prayer team intercedes faithfully for every need — personal, family, health, and spiritual growth.",
    path: "/prayer",
    keywords: ["prayer request Hyderabad", "KCM prayer", "intercessory prayer church"],
  }),
  smallGroups: constructMetadata({
    title: "Small Groups",
    description:
      "Connect with a small group at Kingdom of Christ Ministries. Grow in faith, build genuine friendships, and experience community through Bible study groups across Hyderabad.",
    path: "/get-involved/small-groups",
    keywords: ["small groups Hyderabad", "Bible study group", "church community"],
  }),
  volunteer: constructMetadata({
    title: "Volunteer",
    description:
      "Use your gifts to serve at Kingdom of Christ Ministries. Volunteer opportunities are available in worship, media, hospitality, outreach, children, and youth ministry.",
    path: "/get-involved/volunteer",
    keywords: ["volunteer church Hyderabad", "KCM volunteer", "church service opportunities"],
  }),
  serve: constructMetadata({
    title: "Serve with Us",
    description:
      "Discover meaningful ways to serve God and the community through Kingdom of Christ Ministries' various service and outreach programs in Hyderabad.",
    path: "/get-involved/serve",
    keywords: ["serve church Hyderabad", "community service KCM"],
  }),
  membership: constructMetadata({
    title: "Membership",
    description:
      "Become a member of Kingdom of Christ Ministries. Membership connects you deeper to worship, community, growth, and purposeful service in Hyderabad.",
    path: "/membership",
    keywords: ["church membership Hyderabad", "KCM membership", "join church Hyderabad"],
  }),
  locations: constructMetadata({
    title: "Church Locations & Service Times",
    description:
      "Find a Kingdom of Christ Ministries branch near you. We have churches in Jeedimetla and Bahadurpally, Hyderabad with Sunday worship services and weekly gatherings.",
    path: "/locations",
    keywords: ["KCM locations", "church Jeedimetla Hyderabad", "church Bahadurpally", "Sunday service timings Hyderabad"],
  }),
  gallery: constructMetadata({
    title: "Photo Gallery",
    description:
      "Browse moments from worship services, special events, outreach programs, and church life at Kingdom of Christ Ministries, Hyderabad.",
    path: "/gallery",
    keywords: ["KCM gallery", "church photos Hyderabad"],
  }),
  ngo: constructMetadata({
    title: "KCM Society — Community Outreach & NGO",
    description:
      "Kingdom of Christ Ministries Society provides compassionate community service in Hyderabad — supporting the poor, widows, orphans, and those in need through outreach and welfare programs.",
    path: "/ngo",
    keywords: ["KCM Society NGO", "church outreach Hyderabad", "community welfare Jeedimetla"],
  }),
  ngoProjects: constructMetadata({
    title: "NGO Projects",
    description:
      "Explore the community development, humanitarian, and welfare projects led by Kingdom of Christ Ministries Society in Hyderabad and surrounding regions.",
    path: "/ngo/projects",
    keywords: ["KCM NGO projects", "church welfare Hyderabad"],
  }),
  ngoGallery: constructMetadata({
    title: "NGO Outreach Gallery",
    description:
      "See the impact of Kingdom of Christ Ministries Society's outreach work through photos from food distribution, medical camps, and community programs.",
    path: "/ngo/gallery",
    keywords: ["KCM outreach gallery", "NGO Hyderabad photos"],
  }),
  ngoVideos: constructMetadata({
    title: "NGO Outreach Videos",
    description:
      "Watch video testimonials and ministry footage from Kingdom of Christ Ministries Society's community outreach programs across Hyderabad.",
    path: "/ngo/videos",
    keywords: ["KCM NGO videos", "church outreach videos Hyderabad"],
  }),
  ngoVolunteers: constructMetadata({
    title: "Volunteer with KCM Society",
    description:
      "Join Kingdom of Christ Ministries Society as a volunteer and make a difference in the community through outreach, welfare, and humanitarian programs in Hyderabad.",
    path: "/ngo/volunteers",
    keywords: ["KCM Society volunteer", "NGO volunteer Hyderabad"],
  }),
  contact: constructMetadata({
    title: "Contact Us",
    description:
      "Get in touch with Kingdom of Christ Ministries. Reach us by phone, email, or visit our branches in Jeedimetla and Bahadurpally, Hyderabad.",
    path: "/contact",
    keywords: ["KCM contact", "church Hyderabad phone", "contact church Jeedimetla"],
  }),
  give: constructMetadata({
    title: "Give & Support",
    description:
      "Support the ministry and outreach of Kingdom of Christ Ministries through your generous giving. Every contribution helps transform lives in Hyderabad.",
    path: "/give",
    keywords: ["church donation Hyderabad", "KCM give", "support KCM ministry"],
  }),
  privacy: constructMetadata({
    title: "Privacy Policy",
    description:
      "Read the Privacy Policy of Kingdom of Christ Ministries to understand how we collect, use, and protect your personal information.",
    path: "/privacy",
  }),
  terms: constructMetadata({
    title: "Terms of Service",
    description:
      "Read the Terms of Service for Kingdom of Christ Ministries' website and online platform.",
    path: "/terms",
  }),
  // Private pages — noindex
  login: constructMetadata({
    title: "Member Login",
    description: "Sign in to Kingdom of Christ Ministries member portal.",
    path: "/login",
    noIndex: true,
  }),
  register: constructMetadata({
    title: "Register",
    description: "Create your Kingdom of Christ Ministries account.",
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
