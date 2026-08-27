import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://kcmchurch.vercel.app";
  const now = new Date();

  const publicRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  }> = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/about", priority: 0.9, changeFrequency: "monthly" },
    { path: "/about/story", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about/leadership", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about/beliefs", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about/ministries", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about/mission", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about/pastor-message", priority: 0.7, changeFrequency: "monthly" },
    { path: "/sermons", priority: 0.9, changeFrequency: "weekly" },
    { path: "/events", priority: 0.9, changeFrequency: "daily" },
    { path: "/prayer", priority: 0.8, changeFrequency: "weekly" },
    { path: "/get-involved", priority: 0.8, changeFrequency: "monthly" },
    { path: "/get-involved/small-groups", priority: 0.7, changeFrequency: "monthly" },
    { path: "/get-involved/volunteer", priority: 0.7, changeFrequency: "monthly" },
    { path: "/get-involved/serve", priority: 0.7, changeFrequency: "monthly" },
    { path: "/membership", priority: 0.8, changeFrequency: "monthly" },
    { path: "/locations", priority: 0.9, changeFrequency: "monthly" },
    { path: "/locations/shapur-nagar", priority: 0.8, changeFrequency: "monthly" },
    { path: "/locations/subhash-nagar", priority: 0.8, changeFrequency: "monthly" },
    { path: "/locations/bahadurpally", priority: 0.8, changeFrequency: "monthly" },
    { path: "/gallery", priority: 0.7, changeFrequency: "weekly" },
    { path: "/resources", priority: 0.7, changeFrequency: "weekly" },
    { path: "/resources/bible-study", priority: 0.7, changeFrequency: "weekly" },
    { path: "/resources/media", priority: 0.6, changeFrequency: "weekly" },
    { path: "/ngo", priority: 0.8, changeFrequency: "weekly" },
    { path: "/ngo/projects", priority: 0.7, changeFrequency: "weekly" },
    { path: "/ngo/gallery", priority: 0.6, changeFrequency: "weekly" },
    { path: "/ngo/videos", priority: 0.6, changeFrequency: "weekly" },
    { path: "/ngo/volunteers", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
    { path: "/give", priority: 0.7, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  ];

  return publicRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
