import type { Metadata } from "next";
import { PAGE_METADATA } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = PAGE_METADATA.story;
export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: SITE_URL },
        { name: "About", url: `${SITE_URL}/about` },
        { name: "Our Story", url: `${SITE_URL}/about/story` },
      ])} />
      {children}
    </>
  );
}
