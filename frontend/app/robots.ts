import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/member",
          "/member/",
          "/church-member",
          "/church-member/",
          "/pastor",
          "/pastor/",
          "/pastor-portal",
          "/event-manager",
          "/event-manager/",
          "/event-management",
          "/event-management/",
          "/field-volunteer",
          "/field-volunteer/",
          "/portal-select",
          "/dashboard",
          "/dashboard/",
          "/memberships",
          "/memberships/",
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
