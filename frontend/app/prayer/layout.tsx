import type { Metadata } from "next";
import { PAGE_METADATA } from "@/lib/seo";

export const metadata: Metadata = PAGE_METADATA.prayer;
export default function PrayerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
