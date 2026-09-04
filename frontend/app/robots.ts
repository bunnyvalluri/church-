import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Explicitly allow all public-facing pages
        allow: [
          "/",
          "/about",
          "/about/story",
          "/about/leadership",
          "/about/beliefs",
          "/about/ministries",
          "/about/mission",
          "/about/pastor-message",
          "/sermons",
          "/events",
          "/prayer",
          "/get-involved",
          "/get-involved/small-groups",
          "/get-involved/volunteer",
          "/get-involved/serve",
          "/membership",
          "/locations",
          "/locations/shapur-nagar",
          "/locations/subhash-nagar",
          "/locations/bahadurpally",
          "/gallery",
          "/resources",
          "/resources/bible-study",
          "/resources/media",
          "/ngo",
          "/ngo/projects",
          "/ngo/gallery",
          "/ngo/videos",
          "/ngo/volunteers",
          "/contact",
          "/give",
          "/privacy",
          "/terms",
        ],
        // Block private portals and authenticated routes
        disallow: [
          "/admin",
          "/member",
          "/church-member",
          "/pastor",
          "/pastor-portal",
          "/event-manager",
          "/event-management",
          "/field-volunteer",
          "/portal-select",
          "/dashboard",
          "/memberships",
          "/login",
          "/register",
          "/forgot-password",
          "/select-language",
          "/offline",
          "/api/",
        ],
      },
    ],
    sitemap: [
      "https://kcmchurch.vercel.app/sitemap.xml",
      "https://kcmchurch.vercel.app/image-sitemap.xml",
    ],
  };
}

