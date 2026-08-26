import type { Metadata } from "next";
import { PAGE_METADATA } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = PAGE_METADATA.ngoVolunteers;
export default function NgoVolunteersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: SITE_URL },
        { name: "NGO", url: `${SITE_URL}/ngo` },
        { name: "Volunteers", url: `${SITE_URL}/ngo/volunteers` },
      ])} />
      {children}
    </>
  );
}
