import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kcmchurch.vercel.app";

  const publicRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    lastModified: Date;
  }> = [
    // ── Core pages ────────────────────────────────────────────────────────────
    { path: "/",                          priority: 1.0, changeFrequency: "weekly",  lastModified: new Date("2026-08-28") },

    // ── About ─────────────────────────────────────────────────────────────────
    { path: "/about",                     priority: 0.9, changeFrequency: "monthly", lastModified: new Date("2026-08-01") },
    { path: "/about/story",               priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-07-01") },
    { path: "/about/leadership",          priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-08-01") },
    { path: "/about/beliefs",             priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-06-01") },
    { path: "/about/ministries",          priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-08-01") },
    { path: "/about/mission",             priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-06-01") },
    { path: "/about/pastor-message",      priority: 0.7, changeFrequency: "monthly", lastModified: new Date("2026-08-15") },

    // ── High-traffic / high-churn ─────────────────────────────────────────────
    { path: "/sermons",                   priority: 0.9, changeFrequency: "weekly",  lastModified: new Date("2026-09-01") },
    { path: "/events",                    priority: 0.9, changeFrequency: "daily",   lastModified: new Date("2026-09-01") },
    { path: "/prayer",                    priority: 0.8, changeFrequency: "weekly",  lastModified: new Date("2026-08-15") },
    { path: "/gallery",                   priority: 0.7, changeFrequency: "weekly",  lastModified: new Date("2026-09-01") },

    // ── Get Involved ──────────────────────────────────────────────────────────
    { path: "/get-involved",              priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-08-01") },
    { path: "/get-involved/small-groups", priority: 0.7, changeFrequency: "monthly", lastModified: new Date("2026-08-01") },
    { path: "/get-involved/volunteer",    priority: 0.7, changeFrequency: "monthly", lastModified: new Date("2026-08-01") },
    { path: "/get-involved/serve",        priority: 0.7, changeFrequency: "monthly", lastModified: new Date("2026-08-01") },

    // ── Membership & Support ──────────────────────────────────────────────────
    { path: "/membership",                priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-07-01") },
    { path: "/give",                      priority: 0.7, changeFrequency: "monthly", lastModified: new Date("2026-08-01") },

    // ── Locations ─────────────────────────────────────────────────────────────
    { path: "/locations",                 priority: 0.9, changeFrequency: "monthly", lastModified: new Date("2026-08-01") },
    { path: "/locations/shapur-nagar",    priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-08-01") },
    { path: "/locations/subhash-nagar",   priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-08-01") },
    { path: "/locations/bahadurpally",    priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-08-01") },

    // ── Resources ─────────────────────────────────────────────────────────────
    { path: "/resources",                 priority: 0.7, changeFrequency: "weekly",  lastModified: new Date("2026-08-15") },
    { path: "/resources/bible-study",     priority: 0.7, changeFrequency: "weekly",  lastModified: new Date("2026-08-15") },
    { path: "/resources/media",           priority: 0.6, changeFrequency: "weekly",  lastModified: new Date("2026-08-15") },

    // ── NGO / Outreach ────────────────────────────────────────────────────────
    { path: "/ngo",                       priority: 0.8, changeFrequency: "weekly",  lastModified: new Date("2026-09-01") },
    { path: "/ngo/projects",              priority: 0.7, changeFrequency: "weekly",  lastModified: new Date("2026-09-01") },
    { path: "/ngo/gallery",               priority: 0.6, changeFrequency: "weekly",  lastModified: new Date("2026-09-01") },
    { path: "/ngo/videos",                priority: 0.6, changeFrequency: "weekly",  lastModified: new Date("2026-09-01") },
    { path: "/ngo/volunteers",            priority: 0.6, changeFrequency: "monthly", lastModified: new Date("2026-08-01") },

    // ── Contact & Legal ───────────────────────────────────────────────────────
    { path: "/contact",                   priority: 0.7, changeFrequency: "monthly", lastModified: new Date("2026-08-01") },
    { path: "/privacy",                   priority: 0.3, changeFrequency: "yearly",  lastModified: new Date("2026-01-01") },
    { path: "/terms",                     priority: 0.3, changeFrequency: "yearly",  lastModified: new Date("2026-01-01") },
  ];

  return publicRoutes.map(({ path, priority, changeFrequency, lastModified }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
