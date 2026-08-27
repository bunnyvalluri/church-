import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KCM_BRANCHES, BRANCH_SLUGS } from "@/lib/locationsData";
import { constructMetadata, SITE_URL } from "@/lib/seo";
import { branchLocationSchema, breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return BRANCH_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const branch = KCM_BRANCHES[params.slug];
  if (!branch) return {};

  return constructMetadata({
    title: `${branch.name} | Kingdom of Christ Ministries`,
    description: `${branch.name} of Kingdom of Christ Ministries located at ${branch.address}, ${branch.locality}. Service schedule, directions, and contact information.`,
    path: `/locations/${branch.slug}`,
    overrideFullTitle: true,
    ogImage: branch.heroImage,
    keywords: [
      branch.name,
      `${branch.shortName} church`,
      "Kingdom of Christ Ministries",
      "KCM",
      "church Hyderabad",
      branch.locality,
    ],
  });
}

export default function BranchLocationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const branch = KCM_BRANCHES[params.slug];
  if (!branch) notFound();

  const structuredData = [
    branchLocationSchema(branch),
    breadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Locations", url: `${SITE_URL}/locations` },
      { name: branch.name, url: `${SITE_URL}/locations/${branch.slug}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      {children}
    </>
  );
}
