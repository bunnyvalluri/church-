import type { Metadata } from "next";
import { PAGE_METADATA, SITE_URL } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = PAGE_METADATA.bibleStudy;

export default function BibleStudyLayout({
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
          { name: "Bible Study", url: `${SITE_URL}/resources/bible-study` },
        ])}
      />
      {children}
    </>
  );
}
