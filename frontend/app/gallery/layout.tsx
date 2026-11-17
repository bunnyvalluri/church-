import type { Metadata } from "next";
import { PAGE_METADATA, SITE_URL } from "@/lib/seo";
import rawData from "@/lib/galleryData.json";

export const metadata: Metadata = PAGE_METADATA.gallery;

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  // Standalone Schema.org ImageGallery structured data for Google Image Search Top Ranking
  const gallerySchema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "@id": `${SITE_URL}/gallery#gallery`,
    name: "Kcm church Official Photo Gallery & Moments of Faith",
    description:
      "High-resolution photographs of worship revival, family blessings, pastoral ministry, and church fellowship at Kcm church in Hyderabad, India.",
    url: `${SITE_URL}/gallery`,
    publisher: {
      "@type": "Church",
      name: "Kcm church",
      url: SITE_URL,
    },
    about: {
      "@type": "PlaceOfWorship",
      name: "Kcm church",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        addressCountry: "IN",
      },
    },
    hasPart: rawData.slice(0, 40).map((item: any) => ({
      "@type": "ImageObject",
      name: `Kcm church - ${item.title}`,
      description: item.description,
      contentUrl: `${SITE_URL}${item.url}`,
      thumbnailUrl: `${SITE_URL}${item.thumbnailUrl || item.url}`,
      caption: `Kcm church ${item.branchName || "Hyderabad"} — ${item.title}`,
      representativeOfPage: item.id === "subhash-family-blessing-poster-1",
      creator: {
        "@type": "Organization",
        name: "Kcm church",
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(gallerySchema),
        }}
      />
      {children}
    </>
  );
}
