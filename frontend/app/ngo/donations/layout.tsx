import type { Metadata } from "next";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = constructMetadata({
  title: "Donate & Support (80G Tax Exempt)",
  description:
    "Support Kingdom of Christ Ministries Society (NGO) and church outreach programs in Hyderabad with 80G tax-exempt online giving via instant UPI, card, or bank transfer.",
  path: "/ngo/donations",
  keywords: [
    "KCM NGO donation",
    "80G tax exempt charity Hyderabad",
    "support Kingdom of Christ Ministries",
    "donate church outreach Hyderabad",
  ],
});

export default function NgoDonationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: SITE_URL },
          { name: "NGO", url: `${SITE_URL}/ngo` },
          { name: "Donations (80G)", url: `${SITE_URL}/ngo/donations` },
        ])}
      />
      {children}
    </>
  );
}
