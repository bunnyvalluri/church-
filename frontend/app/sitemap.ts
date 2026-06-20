import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://church-valluri-rahuls-projects.vercel.app"; // Fallback production URL
  
  const routes = [
    "",
    "/about",
    "/about/story",
    "/about/leadership",
    "/about/beliefs",
    "/about/ministries",
    "/about/mission",
    "/about/pastor-message",
    "/prayer",
    "/get-involved/volunteer",
    "/give",
    "/login",
    "/register",
    "/gallery",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : route.startsWith("/about/") ? 0.8 : 0.6,
  }));
}
