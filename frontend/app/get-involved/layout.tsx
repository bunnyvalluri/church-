import type { Metadata } from "next";
import { PAGE_METADATA, SITE_URL } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = PAGE_METADATA.getInvolved;

export default function GetInvolvedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: SITE_URL },
          { name: "Get Involved", url: `${SITE_URL}/get-involved` },
        ])}
      />
      {children}
    </>
  );
}
