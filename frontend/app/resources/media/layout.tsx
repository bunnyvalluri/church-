import type { Metadata } from "next";
import { PAGE_METADATA, SITE_URL } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = PAGE_METADATA.media;

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: SITE_URL },
          { name: "Resources", url: `${SITE_URL}/resources` },
          { name: "Media Library", url: `${SITE_URL}/resources/media` },
        ])}
      />
      {children}
    </>
  );
}
